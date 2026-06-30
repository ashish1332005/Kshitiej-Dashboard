#pragma once

#include "telemetry.h"

bool initOledDisplay();
void showBootScreen();
void showHardwareStatus(bool adxlReady, bool loraReady);
void showTelemetryStatus(const TelemetryData &telemetry, bool loraTxOk);
