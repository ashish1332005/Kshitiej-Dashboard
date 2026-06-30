#include "serial_output.h"

bool looksLikeJsonObject(const String &value) {
  return value.length() >= 2 && value[0] == '{' && value[value.length() - 1] == '}';
}

String extractStringValue(const String &json, const String &key) {
  const String pattern = "\"" + key + "\":\"";
  const int start = json.indexOf(pattern);
  if (start < 0) {
    return "";
  }

  const int valueStart = start + pattern.length();
  const int valueEnd = json.indexOf("\"", valueStart);
  if (valueEnd < 0) {
    return "";
  }

  return json.substring(valueStart, valueEnd);
}

bool packetHasFreefall(const String &payload) {
  // The sender uses "ff":1 for freefall.
  return payload.indexOf("\"ff\":1") >= 0 || payload.indexOf("\"ff\":true") >= 0;
}

String extractPacketId(const String &payload) {
  return extractStringValue(payload, "id");
}

String cleanJsonLine(const ReceivedLoRaPacket &packet) {
  if (!looksLikeJsonObject(packet.payload)) {
    return "";
  }

  String output = "{\"source\":\"lora\",\"packet\":";
  output += packet.payload;
  output += ",\"rssi\":";
  output += packet.rssi;
  output += ",\"snr\":";
  output += String(packet.snr, 1);
  output += ",\"receivedAt\":";
  output += packet.receivedAt;
  output += "}";
  return output;
}

void printPacketJson(const ReceivedLoRaPacket &packet) {
  const String line = cleanJsonLine(packet);
  if (line.length() == 0) {
    Serial.println("{\"source\":\"lora\",\"error\":\"invalid_packet\"}");
    return;
  }

  // Print exactly one JSON object per line for the Node.js backend.
  Serial.println(line);
}
