#include "gps_module.h"

#include <TinyGPSPlus.h>

#include "config.h"
#include "pins.h"

HardwareSerial gpsSerial(1);
TinyGPSPlus gps;

void initGpsModule() {
  gpsSerial.begin(GPS_BAUD_RATE, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
}

void updateGpsModule() {
  // Feed every available GPS byte into TinyGPSPlus.
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }
}

void fillGpsTelemetry(TelemetryData &telemetry) {
  telemetry.gpsValid = gps.location.isValid();

  if (gps.location.isValid()) {
    telemetry.latitude = gps.location.lat();
    telemetry.longitude = gps.location.lng();
  }

  if (gps.altitude.isValid()) {
    telemetry.altitude = gps.altitude.meters();
  }

  if (gps.speed.isValid()) {
    telemetry.speed = gps.speed.kmph();
  }

  if (gps.satellites.isValid()) {
    telemetry.satellites = gps.satellites.value();
  }
}
