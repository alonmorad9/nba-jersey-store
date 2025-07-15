const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// מיקום הקובץ – תיקיית data הראשית
const ACTIVITY_FILE = path.join(__dirname, '../data/activity.json');

// GET /admin-activity?prefix=abc
router.get('/admin-activity', async (req, res) => {
  try {
    const prefix = (req.query.prefix || '').toLowerCase();

    const data = await fs.readFile(ACTIVITY_FILE, 'utf-8');
    let activity = JSON.parse(data);

    if (prefix) {
      activity = activity.filter(
        a => a.username && a.username.toLowerCase().startsWith(prefix)
      );
    }

    res.json(activity);
  } catch (err) {
    console.error('Error reading activity file:', err);
    res.json([]); // מחזיר רשימה ריקה אם יש שגיאה או קובץ חסר
  }
});

module.exports = router;
