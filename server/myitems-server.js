const express = require('express');
const router = express.Router();
const persist = require('./persist_module');

// GET /my-items – מחזיר את כל הרכישות של המשתמש המחובר
router.get('/my-items', async (req, res) => {
  const username = req.cookies.username;
  if (!username) return res.status(401).send('Not logged in');

  try {
    const purchases = await persist.readJSON('purchases.json');
    res.json(purchases[username] || []);
  } catch (err) {
    console.error('Error loading my items:', err);
    res.status(500).send('Could not load purchases');
  }
});

module.exports = router;
