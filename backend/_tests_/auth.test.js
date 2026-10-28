// _tests_/auth.test.js
// Automatic tests: they call the API like Postman would and check the answers.
// Run with:  npm test
// NOTE: tests use the database from MONGO_URI in your .env file.

require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../Models/User');

const unique = Date.now(); // makes the email different on every run
const testUser = {
  name: 'Test User',
  username: `test_${unique}`,
  email: `test_${unique}@example.com`,
  password: '123456',
};

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await User.deleteMany({ email: testUser.email }); // clean up
  await mongoose.disconnect();
});

describe('Auth', () => {
  it('registers a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    console.log(res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.password).toBeUndefined(); // never send the password back
  });

  it('refuses the same email twice', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.statusCode).toBe(400);
  });

  it('logs in with the right password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('refuses a wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
  });
});