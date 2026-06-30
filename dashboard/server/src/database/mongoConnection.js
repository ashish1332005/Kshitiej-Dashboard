import mongoose from 'mongoose';
import { config } from '../config.js';

mongoose.set('strictQuery', true);

export async function connectMongo(socketServer) {
  try {
    console.log(`[mongo] Connecting to ${config.mongoUri}`);
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log('[mongo] Connected');
    socketServer.broadcastSystemStatus({
      service: 'mongodb',
      status: 'connected',
      message: 'MongoDB connected'
    });
  } catch (error) {
    console.error(`[mongo] Connection failed: ${error.message}`);
    socketServer.broadcastSystemStatus({
      service: 'mongodb',
      status: 'error',
      message: error.message
    });
  }
}

mongoose.connection.on('disconnected', () => {
  console.warn('[mongo] Disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('[mongo] Reconnected');
});

mongoose.connection.on('error', (error) => {
  console.error(`[mongo] ${error.message}`);
});

export function mongoState() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] ?? 'unknown';
}
