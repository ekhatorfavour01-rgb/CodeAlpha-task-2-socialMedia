const router = require('express').Router();
const passport = require('passport');
const { register, login, getMe, googleCallback } = require('../Controllers/authController');
const { validateRegister, validateLogin } = require('../Validations/authValidation');
const { authLimiter } = require('../Middleware/rateLimiter');
const { protect } = require('../Middleware/authMiddleware');


router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.get('/me', protect, getMe); // who am i?

// ---------- Google login -------------
// where to send the browser if google login fails
const failureUrl = () => `${(process.env.FRONTEND_URL || 'http://localhost:4000').replace(/\/+$/, '')}/login.html?error=google`;

//if the google key are not in .env
const requireGoogle = (req, res, next) => {

    if (!req.app.locals.googleEnabled) {
        res.status(503);
        return next(new Error('Google login is not set up on this server'));
    }

    next();
};


// the frontend asks this to know whether to show the "continue with google" buton 
router.get('/providers', (req, res) =>
    res.json({ google: !! req.app.locals.googleEnabled })
);

// send the person to google router
router.get('/google', authLimiter, requireGoogle, passport.authenticate('google', { scope: ['profile', 'email'], session: false, prompt: 'select_account' }));

// google send s them back here. if it worked, "user" is our account
router.get('/google/callback', requireGoogle, (req, res, next) => {
    passport.authenticate('google', { session: false }, (error, user) => {
        if (error || !user) return res.redirect(failureUrl());
        req.user = user;
        
        next();
    })(req, res, next);
},
googleCallback
);

module.exports = router;