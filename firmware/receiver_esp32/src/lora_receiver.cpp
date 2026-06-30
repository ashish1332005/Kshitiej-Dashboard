#include "lora_receiver.h"

#include <LoRa.h>
#include <SPI.h>

#include "config.h"
#include "pins.h"

bool initLoRaReceiver() {
  LoRa.setPins(LORA_SS_PIN, LORA_RST_PIN, LORA_DIO0_PIN);

  if (!LoRa.begin(LORA_FREQUENCY)) {
    return false;
  }

  LoRa.setSyncWord(LORA_SYNC_WORD);
  return true;
}

bool readLoRaPacket(ReceivedLoRaPacket &packet) {
  const int packetSize = LoRa.parsePacket();
  if (packetSize == 0) {
    return false;
  }

  String payload;
  while (LoRa.available()) {
    payload += static_cast<char>(LoRa.read());
  }

  packet.payload = payload;
  packet.rssi = LoRa.packetRssi();
  packet.snr = LoRa.packetSnr();
  packet.receivedAt = millis();
  return true;
}
