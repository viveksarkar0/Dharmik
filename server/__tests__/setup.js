const mongoose = require('mongoose');

beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_EXPIRES_IN = '7d';
});

afterAll(async () => {
  // Close database connection after all tests
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});
