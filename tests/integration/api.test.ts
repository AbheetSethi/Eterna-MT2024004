import request from 'supertest';
import express from 'express';
import routes from '../../src/api/routes';

const app = express();
app.use(express.json());
app.use('/api', routes);

describe('API Endpoints', () => {
  test('GET /api/health returns status', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('cache');
    expect(response.body).toHaveProperty('apis');
  });

  test('GET /api/tokens returns paginated tokens', async () => {
    const response = await request(app)
      .get('/api/tokens?limit=10')
      .expect(200);

    expect(response.body).toHaveProperty('tokens');
    expect(response.body).toHaveProperty('nextCursor');
    expect(Array.isArray(response.body.tokens)).toBe(true);
  }, 15000);

  test('GET /api/tokens supports sorting', async () => {
    const response = await request(app)
      .get('/api/tokens?sortBy=volume&limit=5')
      .expect(200);

    expect(response.body.tokens).toBeTruthy();
  }, 15000);

  test('GET /api/tokens/:address returns 404 for invalid address', async () => {
    const response = await request(app)
      .get('/api/tokens/invalid_address_12345')
      .expect(404);

    expect(response.body).toHaveProperty('error');
  }, 15000);
});
