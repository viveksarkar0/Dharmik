const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const { UserModel } = require('../src/models/User');

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/taskmanager_test');
  });

  beforeEach(async () => {
    // Clean up database before each test
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123',
        role: 'member'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.role).toBe(userData.role);
      expect(response.body.user.password).toBeUndefined();
    });

    it('should return validation error for invalid email', async () => {
      const userData = {
        firstName: 'John',
        email: 'invalid-email',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        firstName: 'John',
        email: 'john@example.com',
        password: 'Password123'
      };

      // Register first user
      await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('User already exists');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post('/auth/register')
        .send({
          firstName: 'John',
          email: 'john@example.com',
          password: 'Password123'
        });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: 'Password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('john@example.com');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return error for invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return validation error for missing fields', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'john@example.com'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /auth/me', () => {
    let authCookie;

    beforeEach(async () => {
      // Register and login to get auth cookie
      await request(app)
        .post('/auth/register')
        .send({
          firstName: 'John',
          email: 'john@example.com',
          password: 'Password123'
        });

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'john@example.com',
          password: 'Password123'
        });

      authCookie = loginResponse.headers['set-cookie'];
    });

    it('should return user data for authenticated user', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe('john@example.com');
    });

    it('should return error for unauthenticated request', async () => {
      const response = await request(app)
        .get('/auth/me')
        .expect(401);

      expect(response.body.message).toContain('Unauthorized');
    });
  });
});
