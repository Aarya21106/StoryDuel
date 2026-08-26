import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './config';

export const socket: Socket = io(API_BASE_URL || undefined, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  auth: {},
});

/**
 * Attach (or clear) the signed-in user's session token so the server can
 * link this connection to their account. Safe to call before or after
 * connecting — guests just never call this and play unauthenticated.
 */
export function setSocketAuthToken(token: string | null) {
  socket.auth = token ? { token } : {};
}
