const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const { UserModel } = require('../src/models/User');
const Task = require('../src/models/Task');

describe('Stats Endpoints', () => {
  let authCookie;
  let adminCookie;
  let userId;
  let adminId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/taskmanager_test');
  });

  beforeEach(async () => {
    await UserModel.deleteMany({});
    await Task.deleteMany({});

    // Create test users
    const memberResponse = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'John',
        email: 'member@example.com',
        password: 'Password123',
        role: 'member'
      });

    const adminResponse = await request(app)
      .post('/auth/register')
      .send({
        firstName: 'Admin',
        email: 'admin@example.com',
        password: 'Password123',
        role: 'admin'
      });

    userId = memberResponse.body.user.id;
    adminId = adminResponse.body.user.id;

    // Get auth cookies
    const memberLogin = await request(app)
      .post('/auth/login')
      .send({
        email: 'member@example.com',
        password: 'Password123'
      });

    const adminLogin = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Password123'
      });

    authCookie = memberLogin.headers['set-cookie'];
    adminCookie = adminLogin.headers['set-cookie'];

    // Create test tasks
    await request(app)
      .post('/tasks')
      .set('Cookie', authCookie)
      .send({
        title: 'Todo Task',
        status: 'todo',
        priority: 'high'
      });

    await request(app)
      .post('/tasks')
      .set('Cookie', authCookie)
      .send({
        title: 'In Progress Task',
        status: 'in-progress',
        priority: 'medium'
      });

    await request(app)
      .post('/tasks')
      .set('Cookie', adminCookie)
      .send({
        title: 'Done Task',
        status: 'done',
        priority: 'low',
        dueDate: '2024-01-01' // Overdue task
      });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('GET /stats/overview', () => {
    it('should return stats overview for member (only their tasks)', async () => {
      const response = await request(app)
        .get('/stats/overview')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalTasks).toBe(2);
      expect(response.body.data.statusCounts.todo).toBe(1);
      expect(response.body.data.statusCounts['in-progress']).toBe(1);
      expect(response.body.data.priorityCounts.high).toBe(1);
      expect(response.body.data.priorityCounts.medium).toBe(1);
    });

    it('should return stats overview for admin (all tasks)', async () => {
      const response = await request(app)
        .get('/stats/overview')
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalTasks).toBe(3);
      expect(response.body.data.statusCounts.todo).toBe(1);
      expect(response.body.data.statusCounts['in-progress']).toBe(1);
      expect(response.body.data.statusCounts.done).toBe(1);
      expect(response.body.data.overdueCount).toBeGreaterThan(0);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/stats/overview')
        .expect(401);

      expect(response.body.message).toContain('Unauthorized');
    });

    it('should include recent tasks in response', async () => {
      const response = await request(app)
        .get('/stats/overview')
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.data.recentTasks).toBeDefined();
      expect(Array.isArray(response.body.data.recentTasks)).toBe(true);
      expect(response.body.data.recentTasks.length).toBeGreaterThan(0);
    });
  });
});
