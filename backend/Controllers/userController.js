const mongoose = require('mongoose');
const User = require('../Models/User');
const Post = require('../Models/Post');
const asyncHandler = require('../Utils/asyncHandler');

// Find a user by id OR by username (so /users/favour and /users/65ab... both work)
const findUser = (idOrUsername) =>
  mongoose.isValidObjectId(idOrUsername)
    ? User.findById(idOrUsername)
    : User.findOne({ username: String(idOrUsername).toLowerCase() });

// GET /api/users/:id   -> one profile with counts
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await findUser(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const postsCount = await Post.countDocuments({ author: user._id });
  const me = req.user ? req.user._id.toString() : null;

  res.json({
    _id: user._id,
    name: user.name,
    username: user.username,
    bio: user.bio,
    avatar: user.avatar,
    createdAt: user.createdAt,
    followersCount: user.followers.length,
    followingCount: user.following.length,
    postsCount,
    isMe: me ? me === user._id.toString() : false, // am I looking at my own profile?
    // is the person looking at this profile already following them?
    isFollowing: me ? user.followers.some((id) => id.toString() === me) : false,
  });
});

// PUT /api/users/profile   -> edit MY profile (login needed)
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, avatar } = req.body;
  const user = req.user; // the logged-in user, put there by "protect"

  // only change what was sent
  if (name !== undefined && name.trim()) user.name = name.trim();
  if (bio !== undefined) user.bio = bio.slice(0, 160);
  if (avatar !== undefined) user.avatar = avatar;

  await user.save();
  res.json({
    _id: user._id,
    name: user.name,
    username: user.username,
    bio: user.bio,
    avatar: user.avatar,
  });
});

// POST /api/users/:id/follow   -> follow, or unfollow if already following
exports.toggleFollow = asyncHandler(async (req, res) => {
  const targetId = req.params.id;
  const myId = req.user._id;

  if (targetId === myId.toString()) {
    res.status(400);
    throw new Error('You cannot follow yourself');
  }

  const target = await User.findById(targetId);
  if (!target) {
    res.status(404);
    throw new Error('User not found');
  }

  const alreadyFollowing = target.followers.some((id) => id.toString() === myId.toString());

  if (alreadyFollowing) {
    // UNFOLLOW: remove each id from the other person's list ($pull = remove from array)
    await User.findByIdAndUpdate(targetId, { $pull: { followers: myId } });
    await User.findByIdAndUpdate(myId, { $pull: { following: targetId } });
  } else {
    // FOLLOW: add the ids ($addToSet = add, but never twice)
    await User.findByIdAndUpdate(targetId, { $addToSet: { followers: myId } });
    await User.findByIdAndUpdate(myId, { $addToSet: { following: targetId } });
  }

  const updated = await User.findById(targetId);
  res.json({ following: !alreadyFollowing, followersCount: updated.followers.length });
});

// GET /api/users/:id/followers   and   /api/users/:id/following
exports.getFollowers = asyncHandler(async (req, res) => {
  const user = await findUser(req.params.id).populate('followers', 'name username avatar');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user.followers);
});

exports.getFollowing = asyncHandler(async (req, res) => {
  const user = await findUser(req.params.id).populate('following', 'name username avatar');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user.following);
});

// GET /api/users?q=fav   -> search users by name or username
exports.searchUsers = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);

  // escape special characters so the search text is treated as plain text
  const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(safe, 'i'); // i = ignore capital letters

  const users = await User.find({ $or: [{ name: regex }, { username: regex }] })
    .select('name username avatar')
    .limit(20);
  res.json(users);
});