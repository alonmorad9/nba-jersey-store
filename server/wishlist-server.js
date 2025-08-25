const express = require('express');
const router = express.Router();
const persist = require('./persist_module');

// GET /wishlist - Get user's wishlist
router.get('/wishlist', async (req, res) => {
  const username = req.cookies.username;
  if (!username) return res.status(401).send('Not logged in');

  try {
    const wishlist = await persist.readUserFile(username, 'wishlist.json');
    const products = await persist.readJSON('products.json');

    const wishlistItems = (wishlist.items || []).map(item => {
      const product = products[item.productId];
      if (product) {
        return {
          ...product,
          addedAt: item.addedAt
        };
      }
      return null;
    }).filter(Boolean);

    res.json(wishlistItems);
  } catch (error) {
    console.error('Error loading wishlist:', error);
    res.status(500).send('Failed to load wishlist');
  }
});

// POST /wishlist - Add item to wishlist
router.post('/wishlist', async (req, res) => {
  const username = req.cookies.username;
  if (!username) return res.status(401).send('Not logged in');

  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).send('Product ID is required');
    }

    // Verify product exists
    const products = await persist.readJSON('products.json');
    if (!products[productId]) {
      return res.status(404).send('Product not found');
    }

    // Get current wishlist
    const wishlist = await persist.readUserFile(username, 'wishlist.json');
    if (!Array.isArray(wishlist.items)) {
      wishlist.items = [];
    }

    // Check if item is already in wishlist
    const existingItem = wishlist.items.find(item => item.productId === productId);
    if (existingItem) {
      return res.status(400).send('Item already in wishlist');
    }

    // Add to wishlist
    wishlist.items.push({
      productId,
      addedAt: new Date().toISOString()
    });

    await persist.writeUserFile(username, 'wishlist.json', wishlist);
    
    // Log activity
    await persist.appendActivity({ username, type: 'wishlist-add' });

    res.send('Item added to wishlist');
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).send('Failed to add to wishlist');
  }
});

// DELETE /wishlist - Remove item from wishlist
router.delete('/wishlist', async (req, res) => {
  const username = req.cookies.username;
  if (!username) return res.status(401).send('Not logged in');

  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).send('Product ID is required');
    }

    // Get current wishlist
    const wishlist = await persist.readUserFile(username, 'wishlist.json');
    if (!Array.isArray(wishlist.items)) {
      return res.status(404).send('Item not found in wishlist');
    }

    // Remove item
    const initialLength = wishlist.items.length;
    wishlist.items = wishlist.items.filter(item => item.productId !== productId);

    if (wishlist.items.length === initialLength) {
      return res.status(404).send('Item not found in wishlist');
    }

    await persist.writeUserFile(username, 'wishlist.json', wishlist);
    
    // Log activity
    await persist.appendActivity({ username, type: 'wishlist-remove' });

    res.send('Item removed from wishlist');
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).send('Failed to remove from wishlist');
  }
});

// POST /wishlist/add-all-to-cart - Add all wishlist items to cart
router.post('/wishlist/add-all-to-cart', async (req, res) => {
  const username = req.cookies.username;
  if (!username) return res.status(401).send('Not logged in');

  try {
    const wishlist = await persist.readUserFile(username, 'wishlist.json');
    
    if (!wishlist.items || wishlist.items.length === 0) {
      return res.status(400).send('Wishlist is empty');
    }

    // Get current cart
    const carts = await persist.readJSON('carts.json');
    if (!carts[username]) carts[username] = [];

    const userCart = await persist.readUserFile(username, 'cart.json');
    if (!Array.isArray(userCart.items)) userCart.items = [];

    let addedCount = 0;
    
    // Add each wishlist item to cart
    for (const wishlistItem of wishlist.items) {
      carts[username].push(wishlistItem.productId);
      userCart.items.push(wishlistItem.productId);
      addedCount++;
    }

    // Save cart data
    await persist.writeJSON('carts.json', carts);
    await persist.writeUserFile(username, 'cart.json', userCart);

    // Clear the wishlist since all items were added to cart
    const emptyWishlist = { items: [] };
    await persist.writeUserFile(username, 'wishlist.json', emptyWishlist);

    // Log activity
    await persist.appendActivity({ username, type: 'wishlist-add-all-to-cart' });

    res.json({ addedCount, message: `${addedCount} items added to cart` });
  } catch (error) {
    console.error('Error adding all to cart:', error);
    res.status(500).send('Failed to add items to cart');
  }
});

// DELETE /wishlist/clear - Clear entire wishlist
router.delete('/wishlist/clear', async (req, res) => {
  const username = req.cookies.username;
  if (!username) return res.status(401).send('Not logged in');

  try {
    const wishlist = { items: [] };
    await persist.writeUserFile(username, 'wishlist.json', wishlist);
    
    // Log activity
    await persist.appendActivity({ username, type: 'wishlist-clear' });

    res.send('Wishlist cleared');
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).send('Failed to clear wishlist');
  }
});

module.exports = router;