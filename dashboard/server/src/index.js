import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { config } from './config.js';
import { connectMongo } from './database/mongoConnection.js';
import { telemetryRoutes } from './routes/telemetryRoutes.js';
import { startSerialReader } from './serial/serialReader.js';
import { startFakeTelemetrySimulator } from './simulator/fakeTelemetry.js';
import { createSocketServer } from './sockets/socketServer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webDistPath = path.resolve(__dirname, '../../web/dist');

const app = express();
const server = http.createServer(app);
const socketServer = createSocketServer(server);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.clientOrigins.includes('*') || config.clientOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    }
  })
);
app.use(express.json());

app.use('/api', telemetryRoutes(socketServer));

app.use(express.static(webDistPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(webDistPath, 'index.html'));
});

app.use((error, _req, res, _next) => {
  const status = error.name === 'ValidationError' ? 400 : 500;
  console.error(`[api] ${error.message}`);
  res.status(status).json({ error: error.message });
});

server.listen(config.port, () => {
  const mode = config.simulatorMode ? 'simulator' : 'serial';
  console.log(`[server] AAD telemetry backend listening on port ${config.port} (${mode} mode)`);
  socketServer.broadcastSystemStatus({
    service: 'server',
    status: 'online',
    mode,
    message: `HTTP server listening on port ${config.port} in ${mode} mode`
  });
});

connectMongo(socketServer);

if (config.simulatorMode) {
  startFakeTelemetrySimulator({ socketServer });
} else {
  startSerialReader({
    socketServer
  });
}

