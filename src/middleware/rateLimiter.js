import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many attempts. Please try again after 15 minutes.",
    },
});

export const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many AI requests. Please wait a minute and try again.",
    },
});

export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests. Please try again later.",
    },
});
