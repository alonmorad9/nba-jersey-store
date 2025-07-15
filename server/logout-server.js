const express = require('express');
const router = express.Router();
const persist = require('./persist_module');

// POST /logout – מוחק את ה-cookie, רושם פעילות ומחזיר תשובה
router.post('/logout', async (req, res) => {
  const username = req.cookies.username;

  if (username) {
    await persist.appendActivity({ username, type: 'logout' });
  }

  res.clearCookie('username');
  res.send('Logged out');
});

module.exports = router;
