#pragma once

#include <Arduino.h>

// Serial monitor and Node.js backend baud rate.
constexpr unsigned long SERIAL_BAUD_RATE = 115200;

// SX1278 LoRa frequency. Use 433 MHz modules with this value.
constexpr long LORA_FREQUENCY = 433E6;

// Match this sync word with the sender firmware.
constexpr byte LORA_SYNC_WORD = 0xA5;

// OLED display settings for a common 128x64 SSD1306 module.
constexpr int OLED_WIDTH = 128;
constexpr int OLED_HEIGHT = 64;
constexpr int OLED_RESET_PIN = -1;
constexpr int OLED_I2C_ADDRESS = 0x3C;
