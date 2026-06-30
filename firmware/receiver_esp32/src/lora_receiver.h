#pragma once

#include <Arduino.h>

struct ReceivedLoRaPacket {
  String payload;
  int rssi = 0;
  float snr = 0.0f;
  unsigned long receivedAt = 0;
};

bool initLoRaReceiver();
bool readLoRaPacket(ReceivedLoRaPacket &packet);
