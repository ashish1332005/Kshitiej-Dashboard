export function getBatteryStatus(voltage) {
  if (!Number.isFinite(voltage)) {
    return { label: 'Unknown', tone: 'yellow', detail: 'Battery reading is not available' };
  }

  if (voltage < 3.5) {
    return { label: 'Low', tone: 'red', detail: 'Charge or replace the battery soon' };
  }

  if (voltage < 3.7) {
    return { label: 'Watch', tone: 'yellow', detail: 'Battery is usable but getting low' };
  }

  return { label: 'Good', tone: 'green', detail: 'Battery level is healthy' };
}

export function getSignalStatus(rssi, snr) {
  if (!Number.isFinite(rssi) && !Number.isFinite(snr)) {
    return { label: 'Unknown', tone: 'yellow', detail: 'Signal reading is not available' };
  }

  if (Number.isFinite(rssi) && rssi < -115) {
    return { label: 'Very Weak', tone: 'red', detail: 'Device may disconnect or miss packets' };
  }

  if (Number.isFinite(rssi) && rssi < -100) {
    return { label: 'Weak but Connected', tone: 'yellow', detail: 'Live data is connected, signal is weak' };
  }

  return { label: 'Good', tone: 'green', detail: 'LoRa signal is healthy' };
}

export function getMotionStatus(packet) {
  if (packet?.event?.freefall) {
    return { label: 'Freefall Detected', tone: 'red', detail: 'Check the person or device immediately' };
  }

  const g = packet?.acceleration?.gMagnitude;
  if (!Number.isFinite(g)) {
    return { label: 'Unknown', tone: 'yellow', detail: 'Motion reading is not available' };
  }

  if (g < 0.3) {
    return { label: 'Possible Fall', tone: 'red', detail: 'Low G force detected' };
  }

  if (g > 2.5) {
    return { label: 'High Impact', tone: 'yellow', detail: 'Strong movement detected' };
  }

  return { label: 'Normal', tone: 'green', detail: 'Movement is within normal range' };
}

export function getGpsStatus(gps) {
  if (gps?.valid) {
    return { label: 'Tracking Active', tone: 'green', detail: 'Live location is available' };
  }

  return {
    label: 'Waiting for Fix',
    tone: 'yellow',
    detail: 'Move the device near open sky for GPS satellite lock'
  };
}

export function getOverallCondition({ packet, isTelemetryStale }) {
  const motion = getMotionStatus(packet);
  const battery = getBatteryStatus(packet?.battery?.voltage);
  const signal = getSignalStatus(packet?.lora?.rssi, packet?.lora?.snr);
  const gps = getGpsStatus(packet?.gps);

  if (!packet || isTelemetryStale) {
    return {
      label: 'Offline',
      tone: 'red',
      action: 'Check receiver connection and backend status',
      motion,
      battery,
      signal,
      gps
    };
  }

  if (motion.tone === 'red') {
    return {
      label: 'Danger',
      tone: 'red',
      action: 'Freefall detected. Check immediately and use last known location.',
      motion,
      battery,
      signal,
      gps
    };
  }

  if (battery.tone === 'red' || signal.tone === 'red') {
    return {
      label: 'Warning',
      tone: 'yellow',
      action: 'Device is online, but one condition needs attention.',
      motion,
      battery,
      signal,
      gps
    };
  }

  if (battery.tone === 'yellow' || signal.tone === 'yellow' || gps.tone === 'yellow') {
    return {
      label: 'Watch',
      tone: 'yellow',
      action: 'Device is usable. Keep watching the highlighted condition.',
      motion,
      battery,
      signal,
      gps
    };
  }

  return {
    label: 'Safe',
    tone: 'green',
    action: 'No action needed.',
    motion,
    battery,
    signal,
    gps
  };
}

export function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) {
    return '0 sec';
  }

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}

export function calculateSignalQuality(rssi, snr) {
  const rssiScore = Number.isFinite(rssi) ? Math.max(0, Math.min(100, ((rssi + 120) / 60) * 100)) : 0;
  const snrScore = Number.isFinite(snr) ? Math.max(0, Math.min(100, ((snr + 5) / 20) * 100)) : 0;
  return Math.round((rssiScore * 0.65) + (snrScore * 0.35));
}

export function calculateDeviceHealth(packet, isTelemetryStale = false) {
  if (!packet || isTelemetryStale) {
    return 0;
  }

  const battery = getBatteryStatus(packet.battery?.voltage);
  const signalQuality = calculateSignalQuality(packet.lora?.rssi, packet.lora?.snr);
  const motion = getMotionStatus(packet);
  const gps = getGpsStatus(packet.gps);

  let score = 0;
  score += gps.tone === 'green' ? 25 : 10;
  score += motion.tone === 'green' ? 30 : motion.tone === 'yellow' ? 12 : 0;
  score += battery.tone === 'green' ? 20 : battery.tone === 'yellow' ? 10 : 0;
  score += Math.round(signalQuality * 0.25);

  return Math.max(0, Math.min(100, score));
}

export function detectPacketLoss(packets) {
  if (packets.length < 2) {
    return { lostPackets: 0, gaps: [] };
  }

  const gaps = [];
  for (let index = 1; index < packets.length; index += 1) {
    const previous = packets[index - 1]?.sequence;
    const current = packets[index]?.sequence;
    if (!Number.isFinite(previous) || !Number.isFinite(current)) {
      continue;
    }

    const expected = previous + 1;
    if (current > expected) {
      gaps.push({
        expected,
        received: current,
        lost: current - expected
      });
    }
  }

  return {
    lostPackets: gaps.reduce((total, gap) => total + gap.lost, 0),
    gaps
  };
}

export function distanceMeters(from, to) {
  if (!from || !to) {
    return null;
  }

  const earthRadius = 6371000;
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const deltaLat = ((to.lat - from.lat) * Math.PI) / 180;
  const deltaLng = ((to.lng - from.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}
