#pragma once

#include <Arduino.h>

#include "lora_receiver.h"

String cleanJsonLine(const ReceivedLoRaPacket &packet);
String extractPacketId(const String &payload);
bool packetHasFreefall(const String &payload);
void printPacketJson(const ReceivedLoRaPacket &packet);
