import { io, Socket } from 'socket.io-client';

const URL = import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin;

export const socket: Socket = io(URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
