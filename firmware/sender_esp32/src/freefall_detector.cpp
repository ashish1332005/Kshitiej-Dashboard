#include "freefall_detector.h"

#include <math.h>

#include "config.h"

unsigned long lowGStartedAt = 0;

float calculateGMagnitude(float ax, float ay, float az) {
  return sqrt((ax * ax) + (ay * ay) + (az * az));
}

bool updateFreefallDetector(float gMagnitude) {
  const unsigned long now = millis();

  if (gMagnitude < FREEFALL_G_THRESHOLD) {
    if (lowGStartedAt == 0) {
      lowGStartedAt = now;
    }

    return now - lowGStartedAt >= FREEFALL_MIN_DURATION_MS;
  }

  lowGStartedAt = 0;
  return false;
}
