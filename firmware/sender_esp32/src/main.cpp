#include <Arduino.h>

#include "adxl375_module.h"
#include "config.h"
#include "display_oled.h"
#include "freefall_detector.h"
#include "gps_module.h"
#include "lora_sender.h"
#include "packet_builder.h"
#include "pins.h"
#include "telemetry.h"

TelemetryData telemetry;
unsigned long lastSendAt = 0;
unsigned long sequenceNumber = 1;
bool oledReady = false;
bool adxlReady = false;
bool loraReady = false;

float readBatteryVoltage() {
  // This assumes a 2:1 voltage divider into a 3.3 V ADC.
  // Calibrate the multiplier for your exact resistor values.
  const int raw = analogRead(BATTERY_ADC_PIN);
  const float adcVoltage = (raw / 4095.0f) * 3.3f;
  return adcVoltage * 2.0f;
}

void setup() {
  Serial.begin(SERIAL_BAUD_RATE);
  delay(300);

  Serial.println("{\"source\":\"sender\",\"status\":\"booting\"}");

  oledReady = initOledDisplay();
  if (oledReady) {
    showBootScreen();
  } else {
    Serial.println("{\"source\":\"sender\",\"status\":\"warning\",\"message\":\"OLED init failed\"}");
  }

  initGpsModule();
  adxlReady = initAdxl375Module();
  loraReady = initLoRaSender();

  if (oledReady) {
    showHardwareStatus(adxlReady, loraReady);
  }

  if (!adxlReady) {
    Serial.println("{\"source\":\"sender\",\"status\":\"error\",\"message\":\"ADXL375 init failed\"}");
  }

  if (!loraReady) {
    Serial.println("{\"source\":\"sender\",\"status\":\"error\",\"message\":\"LoRa init failed\"}");
  }

  Serial.println("{\"source\":\"sender\",\"status\":\"ready\"}");
}

void loop() {
  updateGpsModule();

  const unsigned long now = millis();
  if (now - lastSendAt < SEND_INTERVAL_MS) {
    return;
  }

  lastSendAt = now;

  telemetry.id = DEVICE_ID;
  telemetry.seq = sequenceNumber++;

  fillGpsTelemetry(telemetry);

  if (adxlReady) {
    fillAccelerationTelemetry(telemetry);
    telemetry.accelerationValid = true;
    telemetry.gMagnitude = calculateGMagnitude(telemetry.ax, telemetry.ay, telemetry.az);
    telemetry.freefall = updateFreefallDetector(telemetry.gMagnitude);
  } else {
    telemetry.ax = 0.0f;
    telemetry.ay = 0.0f;
    telemetry.az = 0.0f;
    telemetry.gMagnitude = 1.0f;
    telemetry.accelerationValid = false;
    telemetry.freefall = false;
  }

  telemetry.batteryVoltage = readBatteryVoltage();

  const String packetJson = buildTelemetryPacket(telemetry);
  const bool sent = loraReady && sendLoRaPacket(packetJson);

  // Serial is useful for debugging the sender directly.
  Serial.println(packetJson);

  if (oledReady) {
    showTelemetryStatus(telemetry, sent);
  }
}
