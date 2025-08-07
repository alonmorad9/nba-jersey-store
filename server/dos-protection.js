const rateLimit = require('express-rate-limit');

const dosLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 דקה
  max: 100, // עד 100 בקשות לדקה לכל IP
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = dosLimiter;
