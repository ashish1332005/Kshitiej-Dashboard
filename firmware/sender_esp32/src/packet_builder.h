#pragma once

#include <Arduino.h>

#include "telemetry.h"

String buildTelemetryPacket(const TelemetryData &telemetry);
