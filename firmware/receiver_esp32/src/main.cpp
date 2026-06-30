#include <Arduino.h>

#include "config.h"
#include "display_oled.h"
#include "lora_receiver.h"
#include "serial_output.h"

unsigned long packetCount = 0;
bool oledReady = false;

void setup() {
  Serial.begin(SERIAL_BAUD_RATE);
  delay(300);

  oledReady = initOledDisplay();
  if (oledReady) {
    showBootScreen();
  } else {
    Serial.println("{\"source\":\"receiver\",\"status\":\"warning\",\"message\":\"OLED init failed\"}");
  }

  Serial.println("{\"source\":\"receiver\",\"status\":\"booting\"}");

  const bool loraReady = initLoRaReceiver();
  if (oledReady) {
    showLoRaStatus(loraReady);
  }

  if (!loraReady) {
    Serial.println("{\"source\":\"receiver\",\"status\":\"error\",\"message\":\"LoRa init failed\"}");
    while (true) {
      delay(1000);
    }
  }

  Serial.println("{\"source\":\"receiver\",\"status\":\"ready\",\"message\":\"LoRa receiver ready\"}");
}

void loop() {
  ReceivedLoRaPacket packet;

  if (!readLoRaPacket(packet)) {
    return;
  }

  packetCount++;

  const bool freefall = packetHasFreefall(packet.payload);
  const String packetId = extractPacketId(packet.payload);

  if (oledReady) {
    if (freefall) {
      showFreefallAlert(packetCount, packet.rssi, packet.snr);
    } else {
      showReceiveStatus(packetCount, packet.rssi, packet.snr, packetId);
    }
  }

  printPacketJson(packet);
}
