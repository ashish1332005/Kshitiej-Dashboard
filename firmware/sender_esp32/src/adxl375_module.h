#pragma once

#include "telemetry.h"

bool initAdxl375Module();
void fillAccelerationTelemetry(TelemetryData &telemetry);
