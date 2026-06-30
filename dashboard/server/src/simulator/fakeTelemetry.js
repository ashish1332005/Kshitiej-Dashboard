import { Telemetry } from '../database/telemetryModel.js';
import { serializeTelemetry } from '../serial/telemetryParser.js';

const DEVICE_ID = 'aad-simulator-01';
const BASE_LATITUDE = 28.6139;
const BASE_LONGITUDE = 77.209;

let sequence = 1;

function randomBetween(min, max, decimals = 2) {
  const value = min + Math.random() * (max - min);
  return Number(value.toFixed(decimals));
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1, 0));
}

function createFakeTelemetryPacket() {
  const freefall = Math.random() < 0.08;
  const ax = freefall ? randomBetween(-0.08, 0.08, 3) : randomBetween(-0.25, 0.25, 3);
  const ay = freefall ? randomBetween(-0.08, 0.08, 3) : randomBetween(-0.25, 0.25, 3);
  const az = freefall ? randomBetween(-0.08, 0.08, 3) : randomBetween(0.85, 1.15, 3);
  const gMagnitude = Number(Math.sqrt(ax * ax + ay * ay + az * az).toFixed(3));

  return {
    deviceId: DEVICE_ID,
    sequence: sequence++,
    gps: {
      latitude: randomBetween(BASE_LATITUDE - 0.006, BASE_LATITUDE + 0.006, 6),
      longitude: randomBetween(BASE_LONGITUDE - 0.006, BASE_LONGITUDE + 0.006, 6),
      altitude: randomBetween(205, 235, 1),
      speed: randomBetween(0, 18, 1),
      satellites: randomInt(6, 12),
      valid: true
    },
    acceleration: {
      ax,
      ay,
      az,
      gMagnitude
    },
    event: {
      freefall,
      alertLevel: freefall ? 'critical' : Math.random() < 0.12 ? 'warning' : 'normal'
    },
    lora: {
      rssi: randomInt(-112, -62),
      snr: randomBetween(3, 11, 2)
    },
    battery: {
      voltage: randomBetween(3.55, 4.2, 2)
    },
    packet: {
      raw: {
        source: 'simulator'
      }
    },
    receivedAt: new Date()
  };
}

export function startFakeTelemetrySimulator({ socketServer }) {
  console.log('[simulator] Simulator mode enabled. Real serial port is disabled.');
  socketServer.broadcastSystemStatus({
    service: 'backend',
    status: 'simulator',
    mode: 'simulator',
    message: 'Simulator mode enabled. Fake telemetry will be generated every 1 second.'
  });

  const tick = async () => {
    const telemetry = createFakeTelemetryPacket();

    try {
      const saved = await Telemetry.create(telemetry);
      const packet = serializeTelemetry(saved);
      console.log(`[simulator] ${packet.deviceId} #${packet.sequence} saved and broadcast`);
      socketServer.broadcastTelemetry(packet);
    } catch (error) {
      console.error(`[simulator] Failed to save fake telemetry: ${error.message}`);
      socketServer.broadcastSystemStatus({
        service: 'simulator',
        status: 'error',
        mode: 'simulator',
        message: error.message
      });
    }
  };

  tick();
  return setInterval(tick, 1000);
}
