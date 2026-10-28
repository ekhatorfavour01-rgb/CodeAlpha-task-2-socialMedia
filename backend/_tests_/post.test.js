// =====================================================
// _tests_/posts.test.js  -  AUTOMATIC TESTS
// =====================================================
// Run with:  npm test
// A test is a small program that uses your API like a real user and checks
// the answers. "supertest" lets us call the app without starting a server.
//
// NOTE: These tests use the database in your .env. They create two fake
// users with random emails and delete them again at the end.

require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../Models/User');
const Post = require('../Models/Post');
const Comment = require('../Models/Comment');

// A random ending so test users never clash with real ones
const stamp = Date.now();
const alice = { name: 'Alice Test', username: `alice${stamp}`.slice(0, 20), email: `alice${stamp}@test.com`, password: '123456' };
const bob = { name: 'Bob Test', username: `bob${stamp}`.slice(0, 20), email: `bob${stamp}@test.com`, password: '123456' };

let aliceToken, bobToken, aliceId, bobId, postId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI); // connect once before all tests
});

afterAll(async () => {
  // Clean up everything the tests created
  await Comment.deleteMany({ author: { $in: [aliceId, bobId] } });
  await Post.deleteMany({ author: { $in: [aliceId, bobId] } });
  await User.deleteMany({ email: { $in: [alice.email, bob.email] } });
  await mongoose.connection.close();
});

describe('Auth', () => {
  test('registers two users', async () => {
    const a = await request(app).post('/api/auth/register').send(alice);
    const b = await request(app).post('/api/auth/register').send(bob);
    expect(a.statusCode).toBe(201);
    expect(a.body.token).toBeDefined();
    aliceToken = a.body.token; aliceId = a.body._id;
    bobToken = b.body.token; bobId = b.body._id;
  });

  test('rejects a duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send(alice);
    expect(res.statusCode).toBe(400);
  });

  test('logs in, and rejects a wrong password', async () => {
    const ok = await request(app).post('/api/auth/login').send({ email: alice.email, password: '123456' });
    expect(ok.statusCode).toBe(200);
    const bad = await request(app).post('/api/auth/login').send({ email: alice.email, password: 'wrong' });
    expect(bad.statusCode).toBe(401);
  });
});

describe('Posts, likes and comments', () => {
  test('cannot post without logging in', async () => {
    const res = await request(app).post('/api/posts').send({ caption: 'hi' });
    expect(res.statusCode).toBe(401);
  });

  test('creates a post with a video link', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ caption: 'My first post', videoUrl: 'https://example.com/video.mp4' });
    expect(res.statusCode).toBe(201);
    expect(res.body.likesCount).toBe(0);
    postId = res.body._id;
  });

  test('rejects an empty post', async () => {
    const res = await request(app).post('/api/posts').set('Authorization', `Bearer ${aliceToken}`).send({});
    expect(res.statusCode).toBe(400);
  });

  test('the feed shows the post', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.statusCode).toBe(200);
    expect(res.body.posts.some((p) => p._id === postId)).toBe(true);
  });

  test('like toggles on and off', async () => {
    const on = await request(app).post(`/api/posts/${postId}/like`).set('Authorization', `Bearer ${bobToken}`);
    expect(on.body).toEqual({ liked: true, likesCount: 1 });
    const off = await request(app).post(`/api/posts/${postId}/like`).set('Authorization', `Bearer ${bobToken}`);
    expect(off.body).toEqual({ liked: false, likesCount: 0 });
  });

  test('adds and lists a comment', async () => {
    const add = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${bobToken}`)
      .send({ text: 'Nice one!' });
    expect(add.statusCode).toBe(201);

    const list = await request(app).get(`/api/posts/${postId}/comments`);
    expect(list.body.length).toBe(1);
    expect(list.body[0].author.username).toBe(bob.username);
  });

  test('only the author can delete a post', async () => {
    const res = await request(app).delete(`/api/posts/${postId}`).set('Authorization', `Bearer ${bobToken}`);
    expect(res.statusCode).toBe(403);
  });
});

describe('Follow system', () => {
  test('cannot follow yourself', async () => {
    const res = await request(app).post(`/api/users/${aliceId}/follow`).set('Authorization', `Bearer ${aliceToken}`);
    expect(res.statusCode).toBe(400);
  });

  test('bob follows alice and sees her in his following feed', async () => {
    const f = await request(app).post(`/api/users/${aliceId}/follow`).set('Authorization', `Bearer ${bobToken}`);
    expect(f.body).toEqual({ following: true, followersCount: 1 });

    const feed = await request(app).get('/api/posts/following').set('Authorization', `Bearer ${bobToken}`);
    expect(feed.body.posts.some((p) => p._id === postId)).toBe(true);
  });

  test('profile shows counts and isFollowing', async () => {
    const res = await request(app).get(`/api/users/${alice.username}`).set('Authorization', `Bearer ${bobToken}`);
    expect(res.body.followersCount).toBe(1);
    expect(res.body.isFollowing).toBe(true);
    expect(res.body.postsCount).toBe(1);
  });

  test('bob unfollows alice', async () => {
    const res = await request(app).post(`/api/users/${aliceId}/follow`).set('Authorization', `Bearer ${bobToken}`);
    expect(res.body).toEqual({ following: false, followersCount: 0 });
  });
});