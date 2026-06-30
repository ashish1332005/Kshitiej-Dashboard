import dotenv from 'dotenv';

dotenv.config();

const defaultClientOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const clientOrigins = (process.env.CLIENT_ORIGIN ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const resolvedClientOrigins = Array.from(new Set([...clientOrigins, ...defaultClientOrigins]));

export const config = {
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGO_URI ?? process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/aad_telemetry',
  serialPort: process.env.SERIAL_PORT ?? 'COM3',
  baudRate: Number(process.env.BAUD_RATE ?? process.env.SERIAL_BAUD ?? 115200),
  simulatorMode: String(process.env.SIMULATOR_MODE ?? 'false').toLowerCase() === 'true',
  clientOrigin: process.env.CLIENT_ORIGIN ?? defaultClientOrigins[0],
  clientOrigins: clientOrigins.includes('*') ? ['*'] : resolvedClientOrigins
};
