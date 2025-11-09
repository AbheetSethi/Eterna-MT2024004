import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { io as ioClient, Socket } from 'socket.io-client';
import { initWebSocket, broadcastTokenUpdate } from '../../src/api/websocket';
import { TokenData } from '../../src/types';

describe('WebSocket Server', () => {
  let httpServer: any;
  let io: SocketIOServer;
  let clientSocket: Socket;
  let port: number;

  beforeAll((done) => {
    httpServer = createServer();
    io = initWebSocket(httpServer);
    httpServer.listen(() => {
      port = (httpServer.address() as any).port;
      done();
    });
  });

  afterAll((done) => {
    io.close();
    httpServer.close(done);
  });

  beforeEach((done) => {
    clientSocket = ioClient(`http://localhost:${port}`);
    clientSocket.on('connect', done);
  });

  afterEach(() => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  test('client can connect to WebSocket server', (done) => {
    expect(clientSocket.connected).toBe(true);
    done();
  });

  test('client can subscribe to token updates', (done) => {
    clientSocket.emit('subscribe', { tokenAddresses: ['addr1', 'addr2'] });
    
    setTimeout(() => {
      done();
    }, 100);
  });

  test('client receives token updates after subscription', (done) => {
    const mockToken: TokenData = {
      token_address: 'test_addr',
      token_name: 'Test Token',
      token_ticker: 'TST',
      price_sol: 1.5,
      market_cap_sol: 10000,
      volume_sol: 5000,
      liquidity_sol: 2000,
      transaction_count: 500,
      price_1hr_change: 10,
      protocol: 'TestDEX',
      sources: ['test'],
      last_updated: Date.now(),
    };

    clientSocket.emit('subscribe', { tokenAddresses: ['test_addr'] });

    clientSocket.on('token:update', (data) => {
      expect(data.address).toBe('test_addr');
      expect(data.data).toBeTruthy();
      done();
    });

    setTimeout(() => {
      broadcastTokenUpdate(mockToken);
    }, 100);
  });

  test('client can unsubscribe from token updates', (done) => {
    clientSocket.emit('subscribe', { tokenAddresses: ['addr1'] });
    
    setTimeout(() => {
      clientSocket.emit('unsubscribe', { tokenAddresses: ['addr1'] });
      done();
    }, 100);
  });
});
