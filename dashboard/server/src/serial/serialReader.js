import { ReadlineParser } from '@serialport/parser-readline';
import { SerialPort } from 'serialport';
import { config } from '../config.js';
import { Telemetry } from '../database/telemetryModel.js';
import { applyFallDetectionRules, parseTelemetryLine, serializeTelemetry } from './telemetryParser.js';

function parseNumber(value) {
  const match = String(value ?? '').match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function createDashboardTextParser() {
  let current = {};
  let emitted = false;

  function reset() {
    current = {
      deviceId: 'paradigm-device-01',
      receivedAt: new Date()
    };
    emitted = false;
  }

  function toPacket() {
    if (
      !Number.isFinite(current.latitude) ||
      !Number.isFinite(current.longitude) ||
      !Number.isFinite(current.gMagnitude)
    ) {
      return null;
    }

    const freefall = current.freefall === true;

    return {
      deviceId: current.deviceId,
      sequence: Number.isFinite(current.uptime) ? current.uptime : Date.now(),
      gps: {
        latitude: current.latitude,
        longitude: current.longitude,
        altitude: current.altitude ?? null,
        speed: current.speed ?? null,
        satellites: current.satellites ?? null,
        valid: current.gpsFix ?? false
      },
      acceleration: {
        ax: current.ax ?? 0,
        ay: current.ay ?? 0,
        az: current.az ?? 0,
        gMagnitude: current.gMagnitude
      },
      event: {
        freefall,
        alertLevel: freefall ? 'critical' : 'normal'
      },
      lora: {
        rssi: null,
        snr: null
      },
      battery: {
        voltage: null
      },
      packet: {
        raw: {
          source: 'serial-text-dashboard',
          systemState: current.systemState,
          condition: current.condition,
          relayState: current.relayState
        }
      },
      receivedAt: new Date()
    };
  }

  reset();

  return {
    push(line) {
      if (line.includes('PARADIGM SYSTEM DASHBOARD')) {
        reset();
        return null;
      }

      if (/^=+$/.test(line) || /^-+$/.test(line)) {
        if (!emitted) {
          const packet = toPacket();
          if (packet) {
            emitted = true;
            return packet;
          }
        }
        return null;
      }

      const match = line.match(/^([A-Z0-9 /+-]+?)\s*:\s*(.+)$/);
      if (!match) {
        return null;
      }

      const key = match[1].trim();
      const value = match[2].trim();

      switch (key) {
        case 'SYSTEM STATE':
          current.systemState = value;
          break;
        case 'CONDITION':
          current.condition = value;
          break;
        case 'UPTIME':
          current.uptime = parseNumber(value);
          break;
        case 'GPS FIX':
          current.gpsFix = value.toUpperCase() === 'YES';
          break;
        case 'X ACCELERATION':
          current.ax = parseNumber(value);
          break;
        case 'Y ACCELERATION':
          current.ay = parseNumber(value);
          break;
        case 'Z ACCELERATION':
          current.az = parseNumber(value);
          break;
        case 'TOTAL G-FORCE':
          current.gMagnitude = parseNumber(value);
          break;
        case 'FREEFALL STATUS':
          current.freefall = value.toUpperCase() === 'YES';
          break;
        case 'SATELLITES':
          current.satellites = parseNumber(value);
          break;
        case 'LATITUDE':
          current.latitude = parseNumber(value);
          break;
        case 'LONGITUDE':
          current.longitude = parseNumber(value);
          break;
        case 'ALTITUDE':
          current.altitude = parseNumber(value);
          break;
        case 'SPEED':
          current.speed = parseNumber(value);
          break;
        case 'RELAY STATE':
          current.relayState = value;
          break;
        default:
          break;
      }

      return null;
    }
  };
}

export function startSerialReader({ socketServer }) {
  console.log(`[serial] Opening ${config.serialPort} at ${config.baudRate}`);
  const textDashboardParser = createDashboardTextParser();

  const port = new SerialPort({
    path: config.serialPort,
    baudRate: config.baudRate,
    autoOpen: false
  });

  const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

  parser.on('data', async (line) => {
    try {
      const trimmed = String(line ?? '').trim();
      if (!trimmed) {
        return;
      }

      if (!trimmed.startsWith('{')) {
        console.log(`[serial-debug] ${trimmed}`);
        const textPacket = textDashboardParser.push(trimmed);
        if (textPacket) {
          const previous = await Telemetry.findOne({ deviceId: textPacket.deviceId }).sort({ receivedAt: -1 }).lean();
          const normalizedTextPacket = applyFallDetectionRules(textPacket, previous);
          let packet = serializeTelemetry(normalizedTextPacket);

          try {
            const saved = await Telemetry.create(normalizedTextPacket);
            packet = serializeTelemetry(saved);
            console.log(`[telemetry] ${packet.deviceId} #${packet.sequence} saved from text dashboard`);
          } catch (databaseError) {
            console.warn(`[mongo] Text dashboard packet not saved: ${databaseError.message}`);
            socketServer.broadcastSystemStatus({
              service: 'mongodb',
              status: 'warning',
              message: `Text dashboard packet broadcast without MongoDB save: ${databaseError.message}`
            });
          }

          socketServer.broadcastTelemetry(packet);
        }
        return;
      }

      const parsed = parseTelemetryLine(trimmed);

      if (parsed.type === 'system') {
        console.log(`[receiver] ${parsed.payload.status}: ${parsed.payload.message}`);
        socketServer.broadcastSystemStatus(parsed.payload);
        return;
      }

      const previous = await Telemetry.findOne({ deviceId: parsed.payload.deviceId }).sort({ receivedAt: -1 }).lean();
      const normalizedPayload = applyFallDetectionRules(parsed.payload, previous);
      let packet = serializeTelemetry(normalizedPayload);

      try {
        const saved = await Telemetry.create(normalizedPayload);
        packet = serializeTelemetry(saved);
        console.log(`[telemetry] ${packet.deviceId} #${packet.sequence} saved`);
      } catch (databaseError) {
        console.warn(`[mongo] Live packet not saved: ${databaseError.message}`);
        socketServer.broadcastSystemStatus({
          service: 'mongodb',
          status: 'warning',
          message: `Live packet broadcast without MongoDB save: ${databaseError.message}`
        });
      }

      socketServer.broadcastTelemetry(packet);
    } catch (error) {
      console.warn(`[serial] Ignored line: ${error.message}`);
      socketServer.broadcastSystemStatus({
        service: 'serial',
        status: 'warning',
        message: error.message
      });
    }
  });

  port.on('open', () => {
    console.log(`[serial] Connected to ${config.serialPort}`);
    socketServer.broadcastSystemStatus({
      service: 'serial',
      status: 'connected',
      message: `Serial port ${config.serialPort} opened`
    });
  });

  port.on('close', () => {
    console.warn(`[serial] Port ${config.serialPort} closed`);
    socketServer.broadcastSystemStatus({
      service: 'serial',
      status: 'closed',
      message: `Serial port ${config.serialPort} closed`
    });
  });

  port.on('error', (error) => {
    console.error(`[serial] ${error.message}`);
    socketServer.broadcastSystemStatus({
      service: 'serial',
      status: 'error',
      message: error.message
    });
  });

  port.open((error) => {
    if (!error) {
      return;
    }

    console.error(`[serial] Failed to open ${config.serialPort}: ${error.message}`);
    socketServer.broadcastSystemStatus({
      service: 'serial',
      status: 'error',
      message: `Failed to open ${config.serialPort}: ${error.message}`
    });
  });

  return port;
}
