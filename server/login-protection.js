// 🔐 Login Protection Middleware – Limit failed login attempts per username
const loginAttempts = new Map();

// Middleware to check and limit login attempts
function loginLimiter(req, res, next) {
  const { username } = req.body;

  if (!username) {
    return res.status(400).send("Username required");
  }

  const entry = loginAttempts.get(username) || { count: 0, lastAttempt: Date.now(), blockedUntil: 0 };

  if (Date.now() < entry.blockedUntil) {
    return res.status(429).send("🔒 Too many login attempts. Please wait a minute.");
  }

  req.loginRateEntry = entry;
  next();
}

// Record a failed login attempt
function recordLoginFailure(username, entry) {
  entry.count++;
  entry.lastAttempt = Date.now();

  // If 5 failed attempts, block for 1 minute
  if (entry.count >= 5) {
    entry.blockedUntil = Date.now() + 60 * 1000; // Block for 1 minute
    entry.count = 0;
  }

  // Reset count if last attempt was over 10 minutes ago
  loginAttempts.set(username, entry);
}

// Clear login attempts on successful login
function clearLoginAttempts(username) {
  loginAttempts.delete(username);
}

// Export the middleware and functions
module.exports = {
  loginLimiter,
  recordLoginFailure,
  clearLoginAttempts
};
