#include "display_oled.h"

#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Wire.h>

#include "config.h"
#include "pins.h"

Adafruit_SSD1306 display(OLED_WIDTH, OLED_HEIGHT, &Wire, OLED_RESET_PIN);

bool initOledDisplay() {
  Wire.begin(OLED_SDA_PIN, OLED_SCL_PIN);

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
  printHeader("AAD LoRa Receiver");
  display.setCursor(0, 18);
  display.println("Starting...");
  display.println("Serial: 115200");
  display.println("LoRa: 433 MHz");
  display.display();
}

void showLoRaStatus(bool ready) {
  printHeader("AAD LoRa Receiver");
  display.setCursor(0, 18);
  display.println(ready ? "LoRa ready" : "LoRa failed");
  display.println(ready ? "Waiting packets" : "Check wiring");
  display.display();
}

void showReceiveStatus(unsigned long packetCount, int rssi, float snr, const String &packetId) {
  printHeader("RX OK");
  display.setCursor(0, 16);
  display.print("Count: ");
  display.println(packetCount);
  display.print("ID: ");
  display.println(packetId.length() > 0 ? packetId : "unknown");
  display.print("RSSI: ");
  display.println(rssi);
  display.print("SNR: ");
  display.println(snr, 1);
  display.display();
}

void showFreefallAlert(unsigned long packetCount, int rssi, float snr) {
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
  display.setTextSize(2);
  display.setCursor(0, 0);
  display.println("FREEFALL");
  display.println("ALERT");
  display.setTextSize(1);
  display.print("Packets: ");
  display.println(packetCount);
  display.print("RSSI: ");
  display.println(rssi);
  display.print("SNR: ");
  display.println(snr, 1);
  display.display();
}
