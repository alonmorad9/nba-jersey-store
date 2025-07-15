const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const ACTIVITY_FILE = path.join(__dirname, 'data', 'activity.json');

// GET /admin-activity?prefix=abc
router.get('/admin-activity', async (req, res) => {
  try {
    const prefix = (req.query.prefix || '').toLowerCase();
    const data = await fs.readFile(ACTIVITY_FILE, 'utf-8');
    let activity = JSON.parse(data);

    if (prefix) {
      activity = activity.filter(a => a.username.toLowerCase().startsWith(prefix));
    }

    res.json(activity);
  } catch (err) {
    res.json([]); // אם אין קובץ, מחזיר ריק
  }
});

module.exports = router;
