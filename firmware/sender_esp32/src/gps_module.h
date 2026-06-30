#pragma once

#include <Arduino.h>

#include "telemetry.h"

void initGpsModule();
void updateGpsModule();
void fillGpsTelemetry(TelemetryData &telemetry);
