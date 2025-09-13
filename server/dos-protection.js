// Basic DoS protection middleware using express-rate-limit
const rateLimit = require('express-rate-limit');

const dosLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 1000, // up to 1000 requests per minute per IP
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = dosLimiter;
