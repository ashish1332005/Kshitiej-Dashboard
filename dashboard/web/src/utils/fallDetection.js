const MIN_FREEFALL_ALTITUDE_METERS = 300;
const LOW_G_THRESHOLD = 0.35;
const IMPACT_G_THRESHOLD = 3.2;
const HIGH_SPEED_THRESHOLD = 30;
const SPEED_INCREASE_THRESHOLD = 8;

function finiteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function evaluateFallRisk(packet, previousPacket = null) {
  const altitude = finiteNumber(packet?.gps?.altitude);
  const speed = finiteNumber(packet?.gps?.speed);
  const previousSpeed = finiteNumber(previousPacket?.gps?.speed);
  const gMagnitude = finiteNumber(packet?.acceleration?.gMagnitude);
  const hasGpsFix = Boolean(packet?.gps?.valid);

  const altitudeReady = hasGpsFix && altitude !== null && altitude >= MIN_FREEFALL_ALTITUDE_METERS;
  const lowG = gMagnitude !== null && gMagnitude <= LOW_G_THRESHOLD;
  const impactG = gMagnitude !== null && gMagnitude >= IMPACT_G_THRESHOLD;
  const speedHigh = speed !== null && speed >= HIGH_SPEED_THRESHOLD;
  const speedIncreasing =
    speed !== null && previousSpeed !== null && speed - previousSpeed >= SPEED_INCREASE_THRESHOLD;

  const freefall = altitudeReady && (lowG || impactG) && (speedHigh || speedIncreasing);
  const warning =
    !freefall &&
    hasGpsFix &&
    altitude !== null &&
    altitude >= MIN_FREEFALL_ALTITUDE_METERS - 50 &&
    (lowG || impactG || speedHigh || speedIncreasing);

  return {
    alertLevel: freefall ? 'critical' : warning ? 'warning' : 'normal',
    altitudeReady,
    freefall,
    impactG,
    lowG,
    speedHigh,
    speedIncreasing
  };
}

export function applyFallRisk(packet, previousPacket = null) {
  if (!packet) {
    return packet;
  }

  const risk = evaluateFallRisk(packet, previousPacket);
  return {
    ...packet,
    event: {
      ...(packet.event ?? {}),
      alertLevel: risk.alertLevel,
      freefall: risk.freefall
    },
    safety: risk
  };
}
