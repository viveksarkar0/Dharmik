const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');
const { UserModel } = require('../src/models/User');
const Task = require('../src/models/Task');

describe('Task Endpoints', () => {
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
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /tasks', () => {
    it('should create a new task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high',
        dueDate: '2024-12-31',
        tags: ['test', 'important']
      };

      const response = await request(app)
        .post('/tasks')
        .set('Cookie', authCookie)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(taskData.title);
      expect(response.body.data.createdBy.email).toBe('member@example.com');
      expect(response.body.data.activityLog).toHaveLength(1);
    });

    it('should return validation error for missing title', async () => {
      const response = await request(app)
        .post('/tasks')
        .set('Cookie', authCookie)
        .send({
          description: 'Test Description'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /tasks', () => {
    beforeEach(async () => {
      // Create test tasks
      await request(app)
        .post('/tasks')
        .set('Cookie', authCookie)
        .send({
          title: 'Member Task 1',
          description: 'Description 1',
          status: 'todo'
        });

      await request(app)
        .post('/tasks')
        .set('Cookie', adminCookie)
        .send({
          title: 'Admin Task 1',
          description: 'Description 2',
          status: 'in-progress'
        });
    });

    it('should return tasks for member (only their tasks)', async () => {
      const response = await request(app)
        .get('/tasks')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Member Task 1');
    });

    it('should return all tasks for admin', async () => {
      const response = await request(app)
        .get('/tasks')
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/tasks?status=in-progress')
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('in-progress');
    });

    it('should search tasks by title', async () => {
      const response = await request(app)
        .get('/tasks?search=Member')
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toContain('Member');
    });
  });

  describe('PATCH /tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const taskResponse = await request(app)
        .post('/tasks')
        .set('Cookie', authCookie)
        .send({
          title: 'Test Task',
          description: 'Test Description'
        });
      taskId = taskResponse.body.data._id;
    });

    it('should update task successfully', async () => {
      const response = await request(app)
        .patch(`/tasks/${taskId}`)
        .set('Cookie', authCookie)
        .send({
          title: 'Updated Task',
          status: 'in-progress'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Task');
      expect(response.body.data.status).toBe('in-progress');
      expect(response.body.data.activityLog).toHaveLength(2);
    });

    it('should prevent member from updating other user tasks', async () => {
      // Create task as admin
      const adminTaskResponse = await request(app)
        .post('/tasks')
        .set('Cookie', adminCookie)
        .send({
          title: 'Admin Task',
          description: 'Admin Description'
        });

      // Try to update as member
      const response = await request(app)
        .patch(`/tasks/${adminTaskResponse.body.data._id}`)
        .set('Cookie', authCookie)
        .send({
          title: 'Hacked Task'
        })
        .expect(403);

      expect(response.body.message).toBe('Access denied');
    });
  });

  describe('DELETE /tasks/:id', () => {
    let taskId;

    beforeEach(async () => {
      const taskResponse = await request(app)
        .post('/tasks')
        .set('Cookie', authCookie)
        .send({
          title: 'Test Task',
          description: 'Test Description'
        });
      taskId = taskResponse.body.data._id;
    });

    it('should delete task successfully', async () => {
      const response = await request(app)
        .delete(`/tasks/${taskId}`)
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Task deleted successfully');
    });

    it('should allow admin to delete any task', async () => {
      const response = await request(app)
        .delete(`/tasks/${taskId}`)
        .set('Cookie', adminCookie)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
