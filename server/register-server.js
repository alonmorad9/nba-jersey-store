const express = require('express'); // Import the express module to create a web server
const router = express.Router(); // Create a router instance to handle routes
const persist = require('./persist_module'); // Import the persistence module to read and write user data

router.post('/register', async (req, res) => { // Handle POST requests to the /register endpoint
  const { username, password } = req.body;
  const users = await persist.readJSON('users.json'); // Read the existing users from the JSON file

  if (users[username]) { // Check if the username already exists
    return res.status(400).send('Username already exists');
  }

  users[username] = { password }; // Add the new user to the users object
  await persist.writeJSON('users.json', users); // Write the updated users object back to the JSON file

  res.send('User registered successfully'); // Send a success response
});

module.exports = router; // Export the router to be used in the main server file
