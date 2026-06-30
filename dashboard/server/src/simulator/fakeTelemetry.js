import { Telemetry } from '../database/telemetryModel.js';
import { serializeTelemetry } from '../serial/telemetryParser.js';

const DEVICE_ID = 'aad-simulator-01';
const BASE_LATITUDE = 28.6139;
const BASE_LONGITUDE = 77.209;

let sequence = 1;
let latitude = BASE_LATITUDE;
let longitude = BASE_LONGITUDE;

function randomBetween(min, max, decimals = 2) {
  const value = min + Math.random() * (max - min);
  return Number(value.toFixed(decimals));
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1, 0));
}

function createFakeTelemetryPacket() {
  const freefall = false;
  latitude += randomBetween(-0.00004, 0.00004, 6);
  longitude += randomBetween(-0.00004, 0.00004, 6);

  const ax = randomBetween(-0.25, 0.25, 3);
  const ay = randomBetween(-0.25, 0.25, 3);
  const az = randomBetween(0.85, 1.15, 3);
  const gMagnitude = Number(Math.sqrt(ax * ax + ay * ay + az * az).toFixed(3));

  return {
    deviceId: DEVICE_ID,
    sequence: sequence++,
    gps: {
      latitude: Number(latitude.toFixed(6)),
      longitude: Number(longitude.toFixed(6)),
      altitude: randomBetween(205, 235, 1),
      speed: randomBetween(0, 8, 1),
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
      alertLevel: 'normal'
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
