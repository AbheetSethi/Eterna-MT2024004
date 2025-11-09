import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { TokenData } from '../types';
import { detectPriceChange, detectVolumeSpike } from '../utils/helpers';

let io: SocketIOServer | null = null;
const subscriptions = new Map<string, Set<string>>(); // socketId -> Set<tokenAddress>
const tokenCache = new Map<string, TokenData>(); // tokenAddress -> TokenData

export function initWebSocket(server: HTTPServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    subscriptions.set(socket.id, new Set());

    socket.on('subscribe', (data: { tokenAddresses: string[] }) => {
      const subs = subscriptions.get(socket.id);
      if (subs) {
        data.tokenAddresses.forEach(addr => subs.add(addr));
        console.log(`Client ${socket.id} subscribed to:`, data.tokenAddresses);
      }
    });

    socket.on('unsubscribe', (data: { tokenAddresses: string[] }) => {
      const subs = subscriptions.get(socket.id);
      if (subs) {
        data.tokenAddresses.forEach(addr => subs.delete(addr));
        console.log(`Client ${socket.id} unsubscribed from:`, data.tokenAddresses);
      }
    });

    socket.on('disconnect', () => {
      subscriptions.delete(socket.id);
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

export function broadcastTokenUpdate(token: TokenData): void {
  if (!io) return;

  const oldToken = tokenCache.get(token.token_address);
  
  // Update cache
  tokenCache.set(token.token_address, token);

  // Broadcast to subscribed clients
  subscriptions.forEach((tokenAddresses, socketId) => {
    if (tokenAddresses.has(token.token_address)) {
      io?.to(socketId).emit('token:update', {
        address: token.token_address,
        data: token,
      });

      // Check for price change
      if (oldToken) {
        const priceChange = detectPriceChange(oldToken, token);
        if (Math.abs(priceChange) > 5) {
          io?.to(socketId).emit('token:price-change', {
            address: token.token_address,
            change: priceChange,
          });
        }

        // Check for volume spike
        if (detectVolumeSpike(oldToken, token)) {
          io?.to(socketId).emit('token:volume-spike', {
            address: token.token_address,
            volume: token.volume_sol,
          });
        }
      }
    }
  });
}

export function broadcastMultipleTokens(tokens: TokenData[]): void {
  tokens.forEach(token => broadcastTokenUpdate(token));
}

export function getIO(): SocketIOServer | null {
  return io;
}
