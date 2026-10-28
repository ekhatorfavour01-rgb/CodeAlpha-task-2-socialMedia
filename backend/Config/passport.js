// =====================================================================
// Passport is a helper that knows how to talk to Google for us.
// The story: the person presses "Continue with Google" -> Google asks them to
// pick an account -> Google sends them back to us with their name, email and
// picture -> we find (or create) their account here -> we give them our own
// login token, exactly like a normal login.
//
// If GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are missing from .env, Google
// login simply stays switched off and the rest of the app works normally.

const crypto = require('crypto');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../Models/User');

// Make a username like "favour123" from the email "favour@gmail.com".
// Usernames must be unique, so if it is taken we add 4 random digits.
const makeUsername = async (email) => {
  let base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 14);
  if (base.length < 3) base += 'user';

  let username = base;
  for (let tries = 0; tries < 10; tries++) {
    const taken = await User.exists({ username });
    if (!taken) return username;
    username = base + Math.floor(1000 + Math.random() * 9000);
  }
  return base + Date.now().toString().slice(-6);
};

// Given the Google profile, return our own user (existing or brand new).
const findOrCreateGoogleUser = async (profile) => {
  const googleEmail = profile.emails && profile.emails[0];
  if (!googleEmail || !googleEmail.value) {
    throw new Error('Google did not share an email address');
  }
  // We only trust emails that Google has verified
  if (String(googleEmail.verified) === 'false') {
    throw new Error('Your Google email is not verified');
  }

  const email = googleEmail.value.toLowerCase();
  const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : '';

  // 1) Already know this person? (same Google id, or same email from a normal sign-up)
  const existing = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });
  if (existing) {
    if (!existing.googleId) {
      existing.googleId = profile.id; // link the Google account to the old one
      if (!existing.avatar) existing.avatar = avatar;
      await existing.save();
    }
    return existing;
  }

  // 2) New person: create an account. They never type a password, so we give
  //    the account a long random one that nobody knows.
  return User.create({
    name: profile.displayName || email.split('@')[0],
    username: await makeUsername(email),
    email,
    googleId: profile.id,
    avatar,
    password: crypto.randomBytes(32).toString('hex'),
  });
};

// Called once when the app starts (see app.js).
// Returns true if Google login is switched on, false if the keys are missing.
const setupPassport = () => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.log('Google login is OFF (add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env to turn it on)');
    return false;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        // The address Google sends the person back to. It must ALSO be written
        // in the Google Cloud console under "Authorized redirect URIs".
        callbackURL: GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          done(null, await findOrCreateGoogleUser(profile));
        } catch (error) {
          done(error);
        }
      }
    )
  );

  console.log('Google login is ON');
  return true;
};

module.exports = setupPassport;
module.exports.findOrCreateGoogleUser = findOrCreateGoogleUser;
module.exports.makeUsername = makeUsername;