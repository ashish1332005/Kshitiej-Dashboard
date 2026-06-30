import { Server } from 'socket.io';
import { config } from '../config.js';

export function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: config.clientOrigin,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`[socket] Client connected: ${socket.id}`);
    socket.emit('systemStatus', {
      service: 'socket',
      status: 'connected',
      mode: config.simulatorMode ? 'simulator' : 'serial',
      message: 'Socket.IO connection established',
      at: new Date().toISOString()
    });

    socket.on('disconnect', (reason) => {
      console.log(`[socket] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return {
    io,
    broadcastTelemetry(packet) {
      io.emit('telemetry', packet);
    },
    broadcastSystemStatus(status) {
      io.emit('systemStatus', {
        mode: config.simulatorMode ? 'simulator' : 'serial',
        ...status,
        at: new Date().toISOString()
      });
    }
  };
}
