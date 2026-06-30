#include "adxl375_module.h"

#include <Adafruit_ADXL375.h>
#include <Adafruit_Sensor.h>

Adafruit_ADXL375 adxl = Adafruit_ADXL375(12345);

bool initAdxl375Module() {
  if (!adxl.begin()) {
    return false;
  }

  // ADXL375 reports acceleration as m/s^2. We convert it to g later.
  adxl.setDataRate(ADXL343_DATARATE_100_HZ);
  return true;
}

void fillAccelerationTelemetry(TelemetryData &telemetry) {
  sensors_event_t event;
  adxl.getEvent(&event);

  constexpr float GRAVITY_MS2 = 9.80665f;
  telemetry.ax = event.acceleration.x / GRAVITY_MS2;
  telemetry.ay = event.acceleration.y / GRAVITY_MS2;
  telemetry.az = event.acceleration.z / GRAVITY_MS2;
}
