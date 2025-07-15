const express = require('express');
const router = express.Router();
const persist = require('./persist_module');

// POST /login
router.post('/login', async (req, res) => {
  const { username, password, remember } = req.body;

  const users = await persist.readJSON('users.json');

  // אם המשתמש לא קיים או הסיסמה לא תואמת
  if (!users[username] || users[username].password !== password) {
    return res.status(401).send('Invalid username or password');
  }

  // זמן תפוגת העוגייה
  const maxAge = remember
    ? 1000 * 60 * 60 * 24 * 12     // 12 ימים
    : 1000 * 60 * 30;              // 30 דקות

  res.cookie('username', username, { maxAge });

  // רישום התחברות לקובץ activity_log.json
  const log = await persist.readJSON('activity_log.json');
  const now = new Date().toISOString();
  log[now] = { username, type: 'login' };
  await persist.writeJSON('activity_log.json', log);
  await persist.appendActivity({ username, type: 'login' });


  res.send('Login successful');
});

module.exports = router;
