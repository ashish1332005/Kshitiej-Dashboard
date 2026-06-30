import { io } from 'socket.io-client';
import { API_URL } from './api';

export function createTelemetrySocket() {
  return io(API_URL);
}
