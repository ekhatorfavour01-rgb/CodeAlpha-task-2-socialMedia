// scripts/seed.js
// Run with:  npm run seed
// It WIPES the users, posts and comments, then fills them with fake data.
// Don't run it on a database that has real data you want to keep!

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../Models/User');
const Post = require('../Models/Post');
const Comment = require('../Models/Comment');
const { users, posts, comments } = require('../data/seedData');

const pick = (array) => array[Math.floor(Math.random() * array.length)];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Clearing old data...');

  await Promise.all([User.deleteMany(), Post.deleteMany(), Comment.deleteMany()]);

  // 1) Create the users (one by one so the password gets scrambled)
  const password = process.env.SEED_PASSWORD || 'password123';
  const created = [];
  for (const u of users) {
    const user = await User.create({
      ...u,
      email: `${u.username}@example.com`,
      password,
      avatar: `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(u.name)}`,
    });
    created.push(user);
  }
  const byUsername = Object.fromEntries(created.map((u) => [u.username, u]));

  // 2) Create the posts, with a few fake likes each
  const createdPosts = [];
  for (const p of posts) {
    const likers = created.filter(() => Math.random() > 0.5).map((u) => u._id);
    const post = await Post.create({
      author: byUsername[p.by]._id,
      caption: p.caption,
      videoUrl: p.videoUrl,
      imageUrl: p.imageUrl,
      likes: likers,
    });
    createdPosts.push(post);
  }

  // 3) Add 1-3 fake comments to every post
  for (const post of createdPosts) {
    const howMany = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < howMany; i++) {
      await Comment.create({ post: post._id, author: pick(created)._id, text: pick(comments) });
    }
    post.commentsCount = howMany;
    await post.save();
  }

  // 4) Make everybody follow a few other people
  for (const me of created) {
    for (const other of created) {
      if (me._id.equals(other._id) || Math.random() > 0.55) continue;
      await User.findByIdAndUpdate(me._id, { $addToSet: { following: other._id } });
      await User.findByIdAndUpdate(other._id, { $addToSet: { followers: me._id } });
    }
  }

  console.log(`Done! Created ${created.length} users, ${createdPosts.length} posts.`);
  console.log(`Log in with  favour@example.com  /  ${password}`);
  await mongoose.disconnect();
};

seed().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});