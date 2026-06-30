#pragma once

#include <Arduino.h>

bool initOledDisplay();
void showBootScreen();
void showLoRaStatus(bool ready);
void showReceiveStatus(unsigned long packetCount, int rssi, float snr, const String &packetId);
void showFreefallAlert(unsigned long packetCount, int rssi, float snr);
