const express = require('express'); // Import the express module to create a web server
const router = express.Router(); // Create a router instance to handle routes
const persist = require('./persist_module'); // Import the persistence module to read and write user data

router.post('/register', async (req, res) => { // Handle POST requests to the /register endpoint
  try {
    const { username, password } = req.body;

    // Input validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Type validation
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Username and password must be strings' });
    }

    // Length validation
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    
    if (trimmedUsername.length === 0 || trimmedPassword.length === 0) {
      return res.status(400).json({ error: 'Username and password cannot be empty' });
    }

    if (trimmedUsername.length < 2 || trimmedUsername.length > 50) {
      return res.status(400).json({ error: 'Username must be between 2-50 characters' });
    }

    if (trimmedPassword.length < 3 || trimmedPassword.length > 100) {
      return res.status(400).json({ error: 'Password must be between 3-100 characters' });
    }

    // Character validation - allow alphanumeric, spaces, basic punctuation
    const usernameRegex = /^[a-zA-Z0-9\s._-]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      return res.status(400).json({ error: 'Username contains invalid characters' });
    }

    const users = await persist.readJSON('users.json'); // Read the existing users from the JSON file

    if (users[trimmedUsername]) { // Check if the username already exists
      return res.status(400).json({ error: 'Username already exists' });
    }

    users[trimmedUsername] = { password: trimmedPassword }; // Add the new user to the users object
    await persist.writeJSON('users.json', users); // Write the updated users object back to the JSON file

    res.json({ message: 'User registered successfully', username: trimmedUsername }); // Send a success response
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

module.exports = router; // Export the router to be used in the main server file
