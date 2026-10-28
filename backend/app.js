const express = require('express');
const cors = require('cors');
const path = require('path');
const passport = require('passport');
const setupPassport = require('./Config/passport');
const { notFound, errorHandler } = require('./Middleware/errorMiddleware');

const app = express();

// On Render the server sits behind a "proxy". This line lets Express see the
// REAL visitor address, which the rate limiter needs to count correctly.
app.set('trust proxy', 1);

// cors() lets your frontend (on Vercel) talk to this backend (on Render).
// Without it the browser blocks the requests.
app.use(cors());

// express.json() lets us read JSON sent in the request body (req.body).
// IMPORTANT: it must come BEFORE the routes, or req.body will be empty!
app.use(express.json());

// Google login: switch Passport on. googleEnabled is true only when the Google keys are in .env.
app.use(passport.initialize());
app.locals.googleEnabled = setupPassport();

// ---------- ROUTES ----------
// Format:  app.use('/url-start', routeFile)
app.use('/api/auth', require('./Routes/authRoute'));         // register + login
app.use('/api/users', require('./Routes/userRoute'));        // profiles + follow
app.use('/api/posts', require('./Routes/postRoute'));        // posts, likes, comments
app.use('/api/comments', require('./Routes/commentRoute'));  // delete a comment

// A tiny "is the server alive?" page. Handy for testing after deploying.
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Also serve the frontend folder (so http://localhost:4000 shows the app).
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// If nobody above answered an /api URL, it does not exist -> 404.
app.use('/api', notFound);

// The LAST thing: the error handler catches every error and answers nicely.
app.use(errorHandler);

module.exports = app;