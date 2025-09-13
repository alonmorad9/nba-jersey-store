const express = require('express');
const router = express.Router();
const persist = require('./persist_module');

// Track additions per user
const addCartTracker = {};
const RATE_LIMIT = 30; // Maximum 30 items per minute
const WINDOW_MS = 60 * 1000; // minute

// GET /products - fetches all products
router.get('/products', async (req, res) => {
  const products = await persist.readJSON('products.json');
  res.json(Object.values(products));
});

// POST /add-to-cart - adds product to cart for authenticated user
router.post('/add-to-cart', async (req, res) => {
  try {
    const username = req.cookies.username;
    if (!username) return res.status(401).send('You must be logged in');

    const { productId, quantity } = req.body;
    
    // Input validation
    if (!productId) {
      return res.status(400).send('Product ID is required');
    }
    
    const qty = parseInt(quantity) || 1;
    if (qty <= 0 || qty > 100) {
      return res.status(400).send('Invalid quantity (must be between 1-100)');
    }

    // Verify product exists
    const allProducts = await persist.readJSON('products.json');
    if (!allProducts[productId]) {
      return res.status(404).send('Product not found');
    }

  // === DOS protection based on quantity of products added ===
  const now = Date.now();
  if (!addCartTracker[username]) {
    addCartTracker[username] = [];
  }

  // Keep only operations from the last minute
  addCartTracker[username] = addCartTracker[username].filter(ts => now - ts.time < WINDOW_MS);

  // Sum of quantities already added in the last minute
  const totalAdded = addCartTracker[username].reduce((sum, ts) => sum + ts.qty, 0);

  if (totalAdded + qty > RATE_LIMIT) {
    return res.status(429).send(`❌ Too many items of the same product added. Limit is ${RATE_LIMIT} per minute.`);
  }

  // Save current operation
  addCartTracker[username].push({ time: now, qty });

  // === 1. Write to carts.json ===
  const carts = await persist.readJSON('carts.json');
  if (!carts[username]) carts[username] = [];
  for (let i = 0; i < qty; i++) {
    carts[username].push(productId);
  }
  await persist.writeJSON('carts.json', carts);

  // === 2. Write to users/{username}/cart.json ===
  const userCart = await persist.readUserFile(username, 'cart.json');
  if (!Array.isArray(userCart.items)) userCart.items = [];
  for (let i = 0; i < qty; i++) {
    userCart.items.push(productId);
  }
  await persist.writeUserFile(username, 'cart.json', userCart);

  // === 3. Remove from wishlist if exists ===
  try {
    const wishlist = await persist.readUserFile(username, 'wishlist.json');
    if (wishlist.items && Array.isArray(wishlist.items)) {
      const initialLength = wishlist.items.length;
      wishlist.items = wishlist.items.filter(item => item.productId !== productId);
      
      // If removed from wishlist, save the change
      if (wishlist.items.length < initialLength) {
        await persist.writeUserFile(username, 'wishlist.json', wishlist);
        await persist.appendActivity({ username, type: 'wishlist-remove-auto' });
      }
    }
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    // Don't fail if there's a problem with the wishlist
  }

  // === Activity ===
  await persist.appendActivity({ username, type: 'add-to-cart' });

  res.json({ 
    message: `${qty} item(s) added to cart`,
    product: allProducts[productId],
    quantity: qty
  });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
