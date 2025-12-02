import request from 'supertest';
import app from '../index';

describe('Auth API', () => {
  describe('POST /api/auth/signup', () => {
    it('should create a new patient account', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          username: `testpatient${Date.now()}`,
          email: `test${Date.now()}@example.com`,
          password: 'Test123!@#',
          userType: 'patient',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.userType).toBe('patient');
    });

    it('should reject signup with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: '123',
          userType: 'patient',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'wrongpassword',
          userType: 'patient',
        });

      expect(response.status).toBe(401);
    });
  });
});
