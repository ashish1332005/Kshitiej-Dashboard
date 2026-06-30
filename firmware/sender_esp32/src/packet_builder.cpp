#include "packet_builder.h"

String buildTelemetryPacket(const TelemetryData &telemetry) {
  char packet[320];

  snprintf(
      packet,
      sizeof(packet),
      "{\"id\":\"%s\",\"seq\":%lu,\"lat\":%.6f,\"lng\":%.6f,\"alt\":%.1f,\"spd\":%.1f,\"sat\":%d,\"gps\":%d,\"ax\":%.2f,\"ay\":%.2f,\"az\":%.2f,\"g\":%.2f,\"ff\":%d,\"bat\":%.2f}",
      telemetry.id,
      telemetry.seq,
      telemetry.latitude,
      telemetry.longitude,
      telemetry.altitude,
      telemetry.speed,
      telemetry.satellites,
      telemetry.gpsValid ? 1 : 0,
      telemetry.ax,
      telemetry.ay,
      telemetry.az,
      telemetry.gMagnitude,
      telemetry.freefall ? 1 : 0,
      telemetry.batteryVoltage);

  return String(packet);
}
