/**
 * Base URL of the game server (Express + Socket.io).
 *
 * In dev, Vite proxies /api and /socket.io to localhost:3001, so a
 * relative path works. In production the client (Vercel) and server
 * (e.g. Railway) live on different domains, so VITE_API_URL must be
 * set at build time to the server's public URL.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');
