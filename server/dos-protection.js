const rateLimit = require('express-rate-limit');

const dosLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 דקה
  max: 1000, // עד 1000 בקשות לדקה לכל IP (reasonable production value)
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = dosLimiter;
