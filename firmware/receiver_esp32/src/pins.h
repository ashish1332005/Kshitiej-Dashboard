#pragma once

// SX1278 LoRa pins for a common ESP32 wiring.
// Change these values if your board is wired differently.
constexpr int LORA_SS_PIN = 5;
constexpr int LORA_RST_PIN = 14;
constexpr int LORA_DIO0_PIN = 26;

// ESP32 default I2C pins used by many OLED modules.
constexpr int OLED_SDA_PIN = 21;
constexpr int OLED_SCL_PIN = 22;
