const express = require('express');
const router = express.Router();
const persist = require('./persist_module');

// gets the cart for the logged-in user
router.get('/cart', async (req, res) => {
  try {
    const username = req.cookies.username;
    if (!username) return res.status(401).send('Not logged in');

    const carts = await persist.readJSON('carts.json');
    const products = await persist.readJSON('products.json');

    const cartItems = (carts[username] || []).map(id => products[id]).filter(Boolean);
    res.json(cartItems);
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).send('Internal server error');
  }
});

// remove a specific quantity of a product from the cart
router.post('/remove-from-cart', async (req, res) => {
  try {
    const username = req.cookies.username;
    if (!username) return res.status(401).send('Not logged in');

    const { productId, quantity } = req.body;
    if (!productId) return res.status(400).send('Product ID is required');
    
    const qty = parseInt(quantity) || 1;
    if (qty <= 0) return res.status(400).send('Invalid quantity');

    const carts = await persist.readJSON('carts.json');

    if (!Array.isArray(carts[username])) {
      return res.status(400).send('Cart not found');
    }

    let removed = 0;
    for (let i = 0; i < qty; i++) {
      const index = carts[username].indexOf(productId);
      if (index === -1) break;
      carts[username].splice(index, 1);
      removed++;
    }

    await persist.writeJSON('carts.json', carts);

    if (removed > 0) {
      res.send(`Removed ${removed} item${removed > 1 ? 's' : ''}`);
    } else {
      res.status(404).send('Item not found in cart');
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).send('Internal server error');
  }
});

// remove all instances of a product from the cart, not just a specific quantity
router.post('/remove-all-from-cart', async (req, res) => {
  // checks
  try {
    const username = req.cookies.username;
    if (!username) return res.status(401).send('Not logged in');

    const { productId } = req.body;
    if (!productId) return res.status(400).send('Product ID is required');
    
    const productIdStr = String(productId);
    const carts = await persist.readJSON('carts.json');

    if (!Array.isArray(carts[username])) {
      return res.status(400).send('Cart not found');
    }


    // remove all instances of a product from the cart
    const originalLength = carts[username].length;
    carts[username] = carts[username].filter(id => id !== productIdStr);
    
    await persist.writeJSON('carts.json', carts);
    
    const removedCount = originalLength - carts[username].length;
    res.send(`Removed ${removedCount} item${removedCount !== 1 ? 's' : ''}`);
  } catch (error) {
    console.error('Error removing all from cart:', error);
    res.status(500).send('Internal server error');
  }
});


module.exports = router;
