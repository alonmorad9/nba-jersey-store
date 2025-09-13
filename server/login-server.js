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
  try {
    const { username, password, remember } = req.body;

    // Input validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Type validation
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Username and password must be strings' });
    }

    // Additional validation
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    
    if (trimmedUsername.length === 0 || trimmedPassword.length === 0) {
      return res.status(400).json({ error: 'Username and password cannot be empty' });
    }

    if (trimmedUsername.length > 50 || trimmedPassword.length > 100) {
      return res.status(400).json({ error: 'Username or password too long' });
    }

    const users = await persist.readJSON('users.json');

    // Check credentials and record failed attempts
    if (!users[trimmedUsername] || users[trimmedUsername].password !== trimmedPassword) {
      recordLoginFailure(trimmedUsername, req.loginRateEntry);
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    clearLoginAttempts(trimmedUsername); // Clear failed attempts on successful login

    // Set cookie 
    const maxAge = remember
      ? 1000 * 60 * 60 * 24 * 12     // 12 days
      : 1000 * 60 * 30;              // 30 minutes

    res.cookie('username', trimmedUsername, { maxAge });

    // append to activity.json
    await persist.appendActivity({ username: trimmedUsername, type: 'login' });

    // create user directory if not exists
    const userDir = path.join(__dirname, '../data/users', trimmedUsername);
    await fs.mkdir(userDir, { recursive: true });

    // add default user.json if not exists
    const userFile = path.join(userDir, 'user.json');
    await fs.writeFile(userFile, JSON.stringify(users[trimmedUsername], null, 2));

    // log activity in user's activity.json
    const activityFile = path.join(userDir, 'activity.json');
    let userActivity = [];
    try {
      const raw = await fs.readFile(activityFile, 'utf-8');
      userActivity = JSON.parse(raw);
    } catch (err) {
      // file might not exist or be empty, nothing to do
      }

      // add login activity
    userActivity.push({ 
      datetime: new Date().toISOString(),
      type: 'login'
    });

    // keep only last 100 activities
    await fs.writeFile(activityFile, JSON.stringify(userActivity, null, 2));

    // Send success response
    res.json({ message: 'Login successful', username: trimmedUsername });
  } catch (error) {
    // Log and send server error
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// export the router
module.exports = router;
