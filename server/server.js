const express = require('express'); // Import the express module to create a web server
const app = express(); // Create an instance of an Express application
const path = require('path'); // Import the path module to handle file paths
const cookieParser = require('cookie-parser'); // Import the cookie-parser middleware to parse cookies in requests
const dosLimiter = require('./dos-protection'); // Import the DOS protection middleware

// Middleware
app.use(express.json()); // Parse JSON bodies in requests
app.use(cookieParser()); // Parse cookies in requests
app.use(dosLimiter); // Apply the DOS protection middleware to limit request rates
app.use(express.static(path.join(__dirname, '../client'))); // Serve static files from the 'client' directory

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/store.html'));
});

// Routes
app.use(require('./register-server')); // Import and use the registration route defined in 'register-server.js'
app.use(require('./login-server')); // Import and use the login route defined in 'login-server.js'
app.use(require('./store-server')); // Import and use the store route defined in 'store-server.js'
app.use(require('./logout-server')); // Import and use the logout route defined in 'logout-server.js'
app.use(require('./cart-server')); // Import and use the cart route defined in 'cart-server.js'
app.use(require('./checkout-server')); // Import and use the checkout route defined in 'checkout-server.js'
app.use(require('./myitems-server')); // Import and use the my items route defined in 'myitems-server.js'
app.use(require('./admin-server')); // Import and use the admin activity route defined in 'admin-server.js'
app.use(require('./profile-server')); // Import and use the profile route defined in 'profile-server.js'
app.use(require('./reviews-server')); // Import and use the reviews route defined in 'reviews-server.js'
app.use(require('./wishlist-server')); // Import and use the wishlist route defined in 'wishlist-server.js'
app.use(require('./contact-server')); // Import and use the contact route defined in 'contact-server.js'

// Start
const PORT = 3000; // Define the port on which the server will listen
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`); // Log a message indicating that the server is running
});

/* register.html displays a form to the user.

A POST request is sent to /register.

The code in register-server.js checks if the user already exists in users.json.

If not - adds them using persist_module.js.

All information is saved to disk (data/users.json).

The response returns to the browser and is displayed in <p id="result">. */