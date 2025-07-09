const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client')));

// Routes
app.use(require('./register-server'));

// Start
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
