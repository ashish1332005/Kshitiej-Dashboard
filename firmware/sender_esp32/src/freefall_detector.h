#pragma once

#include <Arduino.h>

float calculateGMagnitude(float ax, float ay, float az);
bool updateFreefallDetector(float gMagnitude);
