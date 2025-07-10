const express = require('express');
const router = express.Router();

// POST /logout – מוחק את ה-cookie ומחזיר תשובה
router.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.send('Logged out');
});

module.exports = router;
