#include "lora_sender.h"

#include <LoRa.h>
#include <SPI.h>

#include "config.h"
#include "pins.h"

bool initLoRaSender() {
  LoRa.setPins(LORA_SS_PIN, LORA_RST_PIN, LORA_DIO0_PIN);

  if (!LoRa.begin(LORA_FREQUENCY)) {
    return false;
  }

  LoRa.setSyncWord(LORA_SYNC_WORD);
  return true;
}

bool sendLoRaPacket(const String &packetJson) {
  LoRa.beginPacket();
  LoRa.print(packetJson);
  return LoRa.endPacket() == 1;
}
