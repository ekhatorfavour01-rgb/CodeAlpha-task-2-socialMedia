const notFound = (req, res, next) => {
    res.status(404);
    next(new Error(`Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
    
    let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    let message = err.message ||  'Something went wrong';

    if (err.statusCode) status = err.statusCode;

    // bad or wrong id
    if (err.name === 'CastError') {
        status = 404;
        message = 'Not found (bad id)';
    }

    // same email or username used twice
    if (err.code === 11000) {
        status = 400;
        const field = Object.keys(err.keyPattern || {})[0] || 'value';
        message = `That ${field} is already taken`;
    }

    // file too big (from multer)
    if (err.code === 'LIMIT_FILE_SIZE') {
        status = 400;
        message = 'File is too big (max 50 MB)';
    }

    res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };