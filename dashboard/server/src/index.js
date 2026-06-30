import cors from 'cors';
import express from 'express';
import http from 'http';
import { config } from './config.js';
import { connectMongo } from './database/mongoConnection.js';
import { telemetryRoutes } from './routes/telemetryRoutes.js';
import { startSerialReader } from './serial/serialReader.js';
import { startFakeTelemetrySimulator } from './simulator/fakeTelemetry.js';
import { createSocketServer } from './sockets/socketServer.js';

const app = express();
const server = http.createServer(app);
const socketServer = createSocketServer(server);

app.use(cors({ origin: config.clientOrigin }));
app.use(express.json());

app.use('/api', telemetryRoutes(socketServer));

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
