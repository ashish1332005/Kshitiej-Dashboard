#pragma once

// GPS wiring:
// GPS TX -> ESP32 RX16
// GPS RX -> ESP32 TX17
constexpr int GPS_RX_PIN = 16;
constexpr int GPS_TX_PIN = 17;

// ESP32 default I2C pins for OLED and ADXL375.
constexpr int I2C_SDA_PIN = 21;
constexpr int I2C_SCL_PIN = 22;

// SX1278 LoRa pins for a common ESP32 wiring.
// Change these values if your board is wired differently.
constexpr int LORA_SS_PIN = 5;
constexpr int LORA_RST_PIN = 14;
constexpr int LORA_DIO0_PIN = 26;

// Optional battery ADC pin. Use a voltage divider before connecting battery.
constexpr int BATTERY_ADC_PIN = 34;
