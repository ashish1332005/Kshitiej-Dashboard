# Kshitiej-Dashboard

Telemetry dashboard for an ESP32 LoRa sensor link.

## Architecture

```text
ESP32 Sender -> LoRa -> ESP32 Receiver -> USB Serial -> Node.js Backend -> MongoDB -> Socket.IO -> React Dashboard
```

- `firmware/sender_esp32`: reads telemetry and transmits JSON packets over LoRa.
- `firmware/receiver_esp32`: receives LoRa packets and forwards each valid JSON packet to USB serial.
- `dashboard/server`: Express API, serial reader, MongoDB persistence, Socket.IO realtime feed.
- `dashboard/web`: React dashboard with live charts, latest telemetry, and a Leaflet map.
- `docs`: implementation notes and packet contract.

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB running locally
- PlatformIO
- ESP32 boards with compatible LoRa modules

## Setup

1. Install backend dependencies:

   ```bash
   cd dashboard/server
   npm install
   cp .env.example .env
   ```

2. Edit `dashboard/server/.env`:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/aad_telemetry
   SERIAL_PORT=COM5
   SERIAL_BAUD=115200
   CLIENT_ORIGIN=http://localhost:5173
   ```

3. Install frontend dependencies:

   ```bash
   cd ../web
   npm install
   cp .env.example .env
   ```

4. Build and upload firmware with PlatformIO from each firmware folder:

   ```bash
   cd ../../firmware/sender_esp32
   pio run --target upload

   cd ../receiver_esp32
   pio run --target upload
   ```

## Run

Start MongoDB locally, then run the backend:

```bash
cd dashboard/server
npm run dev
```

Run the dashboard:

```bash
cd dashboard/web
npm run dev
```

Open `http://localhost:5173`.

## Telemetry Packet

The receiver forwards one JSON object per serial line:

```json
{
  "deviceId": "aad-sender-01",
  "temperature": 27.4,
  "humidity": 62.1,
  "battery": 4.08,
  "lat": 28.6139,
  "lng": 77.209,
  "rssi": -89,
  "snr": 7.5,
  "timestamp": "2026-06-29T10:30:00.000Z"
}
```

The backend validates and stores packets, then broadcasts them to connected dashboards through Socket.IO.
