#pragma once

#include <Arduino.h>

bool initLoRaSender();
bool sendLoRaPacket(const String &packetJson);
