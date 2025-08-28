const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const { UserModel } = require('../src/models/User');

describe('User Management Endpoints', () => {
  let adminCookie;
  let memberCookie;
  let adminId;
  let memberId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/taskmanager_test');
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});

    // Create admin user
    const adminResponse = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Admin',
        email: 'admin@example.com',
        password: 'Password123',
        role: 'admin'
      });

    // Create member user
    const memberResponse = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Member',
        email: 'member@example.com',
        password: 'Password123',
        role: 'member'
      });

    adminId = adminResponse.body.user.id;
    memberId = memberResponse.body.user.id;

    // Get auth cookies
    const adminLogin = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Password123'
      });

    const memberLogin = await request(app)
      .post('/auth/login')
      .send({
        email: 'member@example.com',
        password: 'Password123'
      });

    adminCookie = adminLogin.headers['set-cookie'];
    memberCookie = memberLogin.headers['set-cookie'];
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /users', () => {
    it('should return all users for admin', async () => {
      const response = await request(app)
        .get('/users')
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.some(user => user.email === 'admin@example.com')).toBe(true);
      expect(response.body.data.some(user => user.email === 'member@example.com')).toBe(true);
    });

    it('should deny access for non-admin users', async () => {
      const response = await request(app)
        .get('/users')
        .set('Cookie', memberCookie)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin role required.');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/users')
        .expect(401);

      expect(response.body.message).toContain('Unauthorized');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/users?page=1&limit=1')
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.pagination.total).toBe(2);
    });

    it('should support search by email', async () => {
      const response = await request(app)
        .get('/users?search=member')
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].email).toBe('member@example.com');
    });
  });

  describe('PATCH /users/:id/role', () => {
    it('should update user role for admin', async () => {
      const response = await request(app)
        .patch(`/users/${memberId}/role`)
        .set('Cookie', adminCookie)
        .send({ role: 'admin' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toBe('admin');
    });

    it('should deny access for non-admin users', async () => {
      const response = await request(app)
        .patch(`/users/${adminId}/role`)
        .set('Cookie', memberCookie)
        .send({ role: 'member' })
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin role required.');
    });

    it('should return error for invalid role', async () => {
      const response = await request(app)
        .patch(`/users/${memberId}/role`)
        .set('Cookie', adminCookie)
        .send({ role: 'invalid' })
        .expect(400);

      expect(response.body.message).toBe('Invalid role. Must be admin or member');
    });

    it('should return error for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .patch(`/users/${fakeId}/role`)
        .set('Cookie', adminCookie)
        .send({ role: 'admin' })
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });
  });
});
