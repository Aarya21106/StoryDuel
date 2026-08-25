import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './config';

export const socket: Socket = io(API_BASE_URL || undefined, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
