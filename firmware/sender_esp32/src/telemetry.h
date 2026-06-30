#pragma once

struct TelemetryData {
  const char *id = "AAD01";
  unsigned long seq = 0;

  double latitude = 0.0;
  double longitude = 0.0;
  double altitude = 0.0;
  double speed = 0.0;
  int satellites = 0;
  bool gpsValid = false;

  float ax = 0.0f;
  float ay = 0.0f;
  float az = 0.0f;
  float gMagnitude = 0.0f;
  bool accelerationValid = false;
  bool freefall = false;

  float batteryVoltage = 0.0f;
};
