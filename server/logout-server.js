const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

// post /logout - clear the username cookie and log the logout activity
router.post('/logout', async (req, res) => {
  const username = req.cookies.username;

  // delete the cookie on client side
  res.clearCookie('username');
  res.send('Logged out');

  if (!username) return;

  try {
    const userDir = path.join(__dirname, '../data/users', username);
    const activityFile = path.join(userDir, 'activity.json');

    let activity = [];
    try {
      const raw = await fs.readFile(activityFile, 'utf-8');
      activity = JSON.parse(raw);
    } catch (e) {
      // no activity file yet
    }

    // add logout entry
    activity.push({
      datetime: new Date().toISOString(),
      type: 'logout'
    });

    await fs.writeFile(activityFile, JSON.stringify(activity, null, 2));
  } catch (err) {
    console.error('Error writing user activity on logout:', err);
  }
});

module.exports = router;
