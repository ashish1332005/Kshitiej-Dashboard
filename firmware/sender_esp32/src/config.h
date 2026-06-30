#pragma once

#include <Arduino.h>

// Serial monitor baud rate.
constexpr unsigned long SERIAL_BAUD_RATE = 115200;

// GPS module baud rate for GY-GPS6 / NEO-6M.
constexpr unsigned long GPS_BAUD_RATE = 9600;

// LoRa radio frequency for SX1278 433 MHz modules.
constexpr long LORA_FREQUENCY = 433E6;
constexpr byte LORA_SYNC_WORD = 0xA5;

// Send one LoRa packet every 500 ms.
constexpr unsigned long SEND_INTERVAL_MS = 500;

// Freefall must stay below this threshold for this long.
constexpr float FREEFALL_G_THRESHOLD = 0.30f;
constexpr unsigned long FREEFALL_MIN_DURATION_MS = 300;

// Device identity sent in every packet.
constexpr const char *DEVICE_ID = "AAD01";

// OLED display settings for a common 128x64 SSD1306 module.
constexpr int OLED_WIDTH = 128;
constexpr int OLED_HEIGHT = 64;
constexpr int OLED_RESET_PIN = -1;
constexpr int OLED_I2C_ADDRESS = 0x3C;
