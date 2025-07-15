const express = require('express'); // Import the express module to create a web server
const app = express(); // Create an instance of an Express application
const path = require('path'); // Import the path module to handle file paths
const cookieParser = require('cookie-parser'); // Import the cookie-parser middleware to parse cookies in requests

// Middleware
app.use(express.json()); // Parse JSON bodies in requests
app.use(cookieParser()); // Parse cookies in requests
app.use(express.static(path.join(__dirname, '../client'))); // Serve static files from the 'client' directory

// Routes
app.use(require('./register-server')); // Import and use the registration route defined in 'register-server.js'
app.use(require('./login-server')); // Import and use the login route defined in 'login-server.js'
app.use(require('./store-server')); // Import and use the store route defined in 'store-server.js'
app.use(require('./logout-server')); // Import and use the logout route defined in 'logout-server.js'
app.use(require('./cart-server')); // Import and use the cart route defined in 'cart-server.js'
app.use(require('./checkout-server')); // Import and use the checkout route defined in 'checkout-server.js'
app.use(require('./myitems-server')); // Import and use the my items route defined in 'myitems-server.js'
app.use(require('./admin-server')); // Import and use the admin activity route defined in 'admin-server.js'


// Start
const PORT = 3000; // Define the port on which the server will listen
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`); // Log a message indicating that the server is running
});

/* register.html מציג טופס למשתמש.

נשלחת בקשת POST ל־/register.

הקוד ב־register-server.js בודק אם המשתמש כבר קיים בקובץ users.json.

אם לא – מוסיף אותו בעזרת persist_module.js.

כל המידע נשמר בדיסק (data/users.json).

התגובה חוזרת לדפדפן ומוצגת ב־<p id="result">. */