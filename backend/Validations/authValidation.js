const emailRegex = /^\S+@\S+\.\S+$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/; // letters, numbers, underscore

exports.validateRegister = (req, res, next) => {
    const { name, username, email, password } =  req.body;

    if (!name || !username || !email || !password) {
        res.status(400);
        return next(new Error('Name, username, email and password are required'));
    }

    if (!usernameRegex.test(username)) {
        res.status(400);
        return next(new Error('Username must be 3-20 letters, numbers or underscore'));
    }

    if (!emailRegex.test(email)) {
        res.status(400);
        return next(new Error('Please enter a valid email'));
    }

    if (password.length < 6) {
        res. status(400);
        return next(new Error('Password must be at least 6 characters'));
    }

    next();
};

exports.validateLogin = (req, res, next) => {
    if (!req.body.email || !req.body.password) {
        res.status(400);
        return next(new Error('Email and password are required'));
    }

    next();
};