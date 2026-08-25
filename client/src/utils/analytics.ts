import { socket } from '../socket';

/**
 * Client analytics helper to send events over Socket.io
 */
export function trackClientEvent(event: string, sessionId?: string) {
  if (socket.connected) {
    socket.emit('track_event', { event, sessionId });
  }
}
