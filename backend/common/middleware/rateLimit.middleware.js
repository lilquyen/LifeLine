const rateLimit = ({ windowMs = 60000, max = 10, keyGenerator } = {}) => {
    const hits = new Map();

    return (req, res, next) => {
        const key = keyGenerator ? keyGenerator(req) : req.ip;
        const now = Date.now();
        const entry = hits.get(key);

        if (!entry || now - entry.start > windowMs) {
            hits.set(key, { count: 1, start: now });
            return next();
        }

        entry.count += 1;
        if (entry.count > max) {
            return res.status(429).json({ success: false, message: 'Too many requests' });
        }

        hits.set(key, entry);
        return next();
    };
};

module.exports = rateLimit;
