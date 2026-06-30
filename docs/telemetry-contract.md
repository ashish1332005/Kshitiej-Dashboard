# Telemetry Contract

The USB serial bridge emits newline-delimited JSON. Each line must contain one complete telemetry packet.

## Packet Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `deviceId` | string | yes | Stable device identifier. |
| `temperature` | number | no | Celsius. |
| `humidity` | number | no | Percent. |
| `battery` | number | no | Volts. |
| `lat` | number | no | Latitude for map display. |
| `lng` | number | no | Longitude for map display. |
| `rssi` | number | no | LoRa RSSI, added by receiver if not sent by sender. |
| `snr` | number | no | LoRa SNR, added by receiver if not sent by sender. |
| `timestamp` | string | no | ISO timestamp. Backend fills current time when omitted. |

## Example

```json
{"deviceId":"aad-sender-01","temperature":27.4,"humidity":62.1,"battery":4.08,"lat":28.6139,"lng":77.209,"timestamp":"2026-06-29T10:30:00.000Z"}
```

## Serial Settings

- Baud rate: `115200`
- Format: 8 data bits, no parity, 1 stop bit
- Message framing: newline terminated
