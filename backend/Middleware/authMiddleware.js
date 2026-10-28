const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const asyncHandler = require('../Utils/asyncHandler');

const getTokenFromHeader = (req) => {
    const header = req.headers.authorization || '';
    return header.startsWith('Bearer ') ? header.split(' ')[1] : null;
};

// you must be login
const protect = asyncHandler(async (req, res, next) => {
    const token = getTokenFromHeader(req);
    if (!token) {
        res.status(401);
        throw new Error('Not logged in');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

    } catch {
        res.status(401);
        throw new Error('Login expired, please login again');
    }

    if (!req.user) {
        res.status(401);
        throw new Error('User no longer exists');
    }

    next();
});

// optionalAuth = logged is nice but not required
const optionalAuth = asyncHandler(async (req, res, next) => {
    const token = getTokenFromHeader(req);

    if (token) {

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id);

        } catch {
            // bad token? just treat the person as a visitor
        }
    }

    next();
});

module.exports = { protect, optionalAuth };