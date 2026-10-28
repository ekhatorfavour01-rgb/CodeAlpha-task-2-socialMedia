const createRateLimiter = ({ windowMs, max, message }) => {
    const hits = new Map(); // visitor ip -> { count, resetAt }

    // every minute throw away old records so the map does not grow forever
    const cleaner = setInterval(() => {
        const now = Date.now();
        for (const [ip, record] of hits) {
            if (record.resetAt <= now) hits.delete(ip);
        }
    }, 60 * 1000);
    cleaner.unref();

    return (req, res, next) => {
        // while running automatic tests we do not want to be blocked
        if (process.env.NODE_ENV === 'test') return next();

        const ip = req.ip || 'unknown';
        const now = Date.now();
        let record = hits.get(ip);

        // first knock, or the old time window is over -> start counting again
        if (!record || record.resetAt <= now) {
            record = { count: 0, resetAt: now + windowMs };
            hits.set(ip, record);
        }

        record.count += 1;

        
        // too many knock -> say "slow down" and tell how long to wait
        if (record.count > max) {
            const waitSeconds = Math.ceil((record.resetAt - now) / 1000);

            res.set('Retry-After', String(waitSeconds));
            const error = new Error(message || 'Too many requests. Please try again later.');
            error.statusCode = 429;

            return next(error);
            
        }

        next();
    };
};

// login and register: 30 tries per 15 minutes per person
const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: 'Too many login attempts. Please wait a few minutes and try again.',
});


// uploading posts and videos: 15 per 15 minutes per person
const uploadLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: 'You are posting too fast. Please wait a few minutes.',
});

module.exports = { createRateLimiter, authLimiter, uploadLimiter };