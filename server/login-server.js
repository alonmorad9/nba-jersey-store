const express = require('express');
const router = express.Router();
const persist = require('./persist_module');
const path = require('path');
const fs = require('fs').promises;

const {
  loginLimiter,
  recordLoginFailure,
  clearLoginAttempts
} = require('./login-protection');

// POST /login
router.post('/login', loginLimiter, async (req, res) => {
  const { username, password, remember } = req.body;

  // Input validation
  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  // Additional validation
  if (username.trim().length === 0 || password.trim().length === 0) {
    return res.status(400).send('Username and password cannot be empty');
  }

  const users = await persist.readJSON('users.json');

  // אם המשתמש לא קיים או הסיסמה לא תואמת
  if (!users[username] || users[username].password !== password) {
    recordLoginFailure(username, req.loginRateEntry);
    return res.status(401).send('Invalid username or password');
  }

  clearLoginAttempts(username); // אפס את הניסיונות לאחר התחברות מוצלחת

  // זמן תפוגת העוגייה
  const maxAge = remember
    ? 1000 * 60 * 60 * 24 * 12     // 12 ימים
    : 1000 * 60 * 30;              // 30 דקות

  res.cookie('username', username, { maxAge });

  // 1. רישום ל־activity הכללי (כמו קודם)
  await persist.appendActivity({ username, type: 'login' });

  // 2. יצירת תיקיית משתמש אם אין
  const userDir = path.join(__dirname, '../data/users', username);
  await fs.mkdir(userDir, { recursive: true });

  // 3. שמירת user.json למשתמש
  const userFile = path.join(userDir, 'user.json');
  await fs.writeFile(userFile, JSON.stringify(users[username], null, 2));

  // 4. עדכון activity.json פר־משתמש
  const activityFile = path.join(userDir, 'activity.json');
  let userActivity = [];
  try {
    const raw = await fs.readFile(activityFile, 'utf-8');
    userActivity = JSON.parse(raw);
  } catch (err) {
    // קובץ עדיין לא קיים – לא בעיה
  }

  userActivity.push({
    datetime: new Date().toISOString(),
    type: 'login'
  });

  await fs.writeFile(activityFile, JSON.stringify(userActivity, null, 2));

  res.send('Login successful');
});

module.exports = router;
