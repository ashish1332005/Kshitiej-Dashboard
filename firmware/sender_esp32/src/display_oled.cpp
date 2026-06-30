#include "display_oled.h"

#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Wire.h>

#include "config.h"
#include "pins.h"

Adafruit_SSD1306 display(OLED_WIDTH, OLED_HEIGHT, &Wire, OLED_RESET_PIN);

bool initOledDisplay() {
  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);

  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_I2C_ADDRESS)) {
    return false;
  }

  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(1);
  display.display();
  return true;
}

void printHeader(const char *title) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println(title);
  display.drawLine(0, 10, OLED_WIDTH, 10, SSD1306_WHITE);
}

void showBootScreen() {
  printHeader("AAD Sender");
  display.setCursor(0, 18);
  display.println("Starting...");
  display.println("GPS RX16 TX17");
  display.println("LoRa 433 MHz");
  display.display();
}

void showHardwareStatus(bool adxlReady, bool loraReady) {
  printHeader("Hardware");
  display.setCursor(0, 18);
  display.print("ADXL375: ");
  display.println(adxlReady ? "OK" : "FAIL");
  display.print("LoRa: ");
  display.println(loraReady ? "OK" : "FAIL");
  display.println("Waiting GPS...");
  display.display();
}

void showTelemetryStatus(const TelemetryData &telemetry, bool loraTxOk) {
  if (telemetry.freefall) {
    display.clearDisplay();
    display.setTextSize(2);
    display.setCursor(0, 0);
    display.println("FREEFALL");
    display.println("WARNING");
    display.setTextSize(1);
    display.print("G: ");
    display.println(telemetry.gMagnitude, 2);
    display.print("LoRa TX: ");
    display.println(loraTxOk ? "OK" : "FAIL");
    display.display();
    return;
  }

  printHeader("AAD Sender TX");
  display.setCursor(0, 14);
  display.print("GPS: ");
  display.println(telemetry.gpsValid ? "OK" : "NO FIX");
  display.print("LoRa TX: ");
  display.println(loraTxOk ? "OK" : "FAIL");
  display.print("Alt: ");
  display.print(telemetry.altitude, 1);
  display.println(" m");
  display.print("G: ");
  display.println(telemetry.gMagnitude, 2);
  display.print("Seq: ");
  display.println(telemetry.seq);
  display.display();
}
