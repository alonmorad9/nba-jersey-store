const express = require('express');
const router = express.Router();
const persist = require('./persist_module');

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const users = await persist.readJSON('users.json');

  if (users[username]) {
    return res.status(400).send('Username already exists');
  }

  users[username] = { password };
  await persist.writeJSON('users.json', users);

  res.send('User registered successfully');
});

module.exports = router;
