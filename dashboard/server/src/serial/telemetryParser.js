const requiredNumberPaths = [
  'sequence',
  'gps.latitude',
  'gps.longitude',
  'acceleration.ax',
  'acceleration.ay',
  'acceleration.az',
  'acceleration.gMagnitude',
  'battery.voltage'
];

const requiredBooleanPaths = ['gps.valid', 'event.freefall'];

function valueAt(source, path) {
  return path.split('.').reduce((current, key) => current?.[key], source);
}

function numberAt(source, path, fallback = null) {
  const value = valueAt(source, path);
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    throw new Error(`${path} must be a number`);
  }
  return numeric;
}

function booleanAt(source, path) {
  const value = valueAt(source, path);
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === 1 || value === '1') {
    return true;
  }

  if (value === 0 || value === '0') {
    return false;
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  throw new Error(`${path} must be a boolean`);
}

function stringAt(source, path) {
  const value = valueAt(source, path);
  return typeof value === 'string' ? value.trim() : '';
}

function looksLikeShortPacket(raw) {
  return raw?.packet || raw?.id || raw?.seq !== undefined || raw?.lat !== undefined;
}

function normalizeShortPacket(raw) {
  const packet = raw.packet && typeof raw.packet === 'object' ? raw.packet : raw;
  const freefall = packet.ff === 1 || packet.ff === '1' || packet.ff === true;

  return {
    deviceId: String(packet.id ?? 'AAD01'),
    sequence: Number(packet.seq ?? 0),
    gps: {
      latitude: Number(packet.lat ?? 0),
      longitude: Number(packet.lng ?? 0),
      altitude: Number(packet.alt ?? 0),
      speed: Number(packet.spd ?? 0),
      satellites: Number(packet.sat ?? 0),
      valid: packet.gps === 1 || packet.gps === '1' || packet.gps === true
    },
    acceleration: {
      ax: Number(packet.ax ?? 0),
      ay: Number(packet.ay ?? 0),
      az: Number(packet.az ?? 0),
      gMagnitude: Number(packet.g ?? 0)
    },
    event: {
      freefall,
      alertLevel: freefall ? 'critical' : 'normal'
    },
    lora: {
      rssi: raw.rssi === undefined ? null : Number(raw.rssi),
      snr: raw.snr === undefined ? null : Number(raw.snr)
    },
    battery: {
      voltage: Number(packet.bat ?? 0)
    },
    packet: {
      raw
    },
    receivedAt: new Date()
  };
}

export function parseTelemetryLine(line) {
  const trimmed = String(line ?? '').trim();
  if (!trimmed) {
    throw new Error('Empty serial line');
  }

  let raw;
  try {
    raw = JSON.parse(trimmed);
  } catch (error) {
    throw new Error(`Invalid JSON: ${error.message}`);
  }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Telemetry packet must be a JSON object');
  }

  if (raw.level && raw.message) {
    return {
      type: 'system',
      payload: {
        service: 'receiver',
        status: raw.level,
        message: raw.message
      }
    };
  }

  if (looksLikeShortPacket(raw)) {
    return {
      type: 'telemetry',
      payload: normalizeShortPacket(raw)
    };
  }

  const deviceId = stringAt(raw, 'deviceId');
  if (!deviceId) {
    throw new Error('deviceId is required');
  }

  for (const path of requiredNumberPaths) {
    numberAt(raw, path);
  }

  for (const path of requiredBooleanPaths) {
    booleanAt(raw, path);
  }

  const alertLevel = stringAt(raw, 'event.alertLevel') || 'normal';
  if (!['normal', 'warning', 'critical'].includes(alertLevel)) {
    throw new Error('event.alertLevel must be normal, warning, or critical');
  }

  return {
    type: 'telemetry',
    payload: {
      deviceId,
      sequence: numberAt(raw, 'sequence'),
      gps: {
        latitude: numberAt(raw, 'gps.latitude'),
        longitude: numberAt(raw, 'gps.longitude'),
        altitude: numberAt(raw, 'gps.altitude'),
        speed: numberAt(raw, 'gps.speed'),
        satellites: numberAt(raw, 'gps.satellites'),
        valid: booleanAt(raw, 'gps.valid')
      },
      acceleration: {
        ax: numberAt(raw, 'acceleration.ax'),
        ay: numberAt(raw, 'acceleration.ay'),
        az: numberAt(raw, 'acceleration.az'),
        gMagnitude: numberAt(raw, 'acceleration.gMagnitude')
      },
      event: {
        freefall: booleanAt(raw, 'event.freefall'),
        alertLevel
      },
      lora: {
        rssi: numberAt(raw, 'lora.rssi'),
        snr: numberAt(raw, 'lora.snr')
      },
      battery: {
        voltage: numberAt(raw, 'battery.voltage')
      },
      packet: {
        raw
      },
      receivedAt: new Date()
    }
  };
}

export function serializeTelemetry(document) {
  const value = document.toObject ? document.toObject() : document;
  return {
    id: value._id ? String(value._id) : undefined,
    deviceId: value.deviceId,
    sequence: value.sequence,
    gps: value.gps,
    acceleration: value.acceleration,
    event: value.event,
    lora: value.lora,
    battery: value.battery,
    packet: value.packet,
    receivedAt: value.receivedAt?.toISOString?.() ?? value.receivedAt
  };
}
