const User = require('../Models/User');
const asyncHandler = require('../Utils/asyncHandler');
const generateToken = require('../Utils/generateToken');

// What we send back after register/login (never the password!)
const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  username: user.username,
  email: user.email,
  bio: user.bio,
  avatar: user.avatar,
  token: generateToken(user._id),
});

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  //Ensure field exist before converting case
  const safeEmail = email ? email.toLowerCase() : '';
  const safeUsername = username ? username.toLowerCase() : '';

  // Is the email or username already used?
  const exists = await User.findOne({
    $or: [{ email: safeEmail }, { username: safeUsername }],
  });
  if (exists) {
    res.status(400);
    throw new Error('Email or username is already taken');
  }

  // Give new users a cute automatic avatar made from their name
  const avatar = `https://ui-avatars.com/api/?background=random&name=${encodeURIComponent(name)}`;

  const user = await User.create({ name, username, email, password, avatar });
  res.status(201).json(userResponse(user)); // 201 = "created"
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Ensure email exists before calling method
  const safeEmail = email ? email.toLowerCase() : '';

  // password is hidden by default, so we ask for it with +password
  const user = await User.findOne({ email: safeEmail }).select('+password');

  if (!user) {
    res.status(401); // 401 = "not allowed"
    throw new Error('Wrong email or password');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Wrong email or password');
  }
  res.json(userResponse(user));
});

// GET /api/auth/me   -> who am I? (login needed). The frontend uses it after Google login.
exports.getMe = asyncHandler(async (req, res) => {
  const { _id, name, username, email, bio, avatar } = req.user;
  res.json({ _id, name, username, email, bio, avatar });
});

// GET /api/auth/google/callback  -> Google sent the person back to us (route runs passport first)
// We make our own login token and send the browser back to the frontend with it.
// The token is put after a "#" so it never travels to any server or shows in server logs.
exports.googleCallback = (req, res) => {
  const frontend = (process.env.FRONTEND_URL || 'http://localhost:4000').replace(/\/+$/, '');
  res.redirect(`${frontend}/login.html#token=${generateToken(req.user._id)}`);
};