const express = require('express');
const router = express.Router();
const persist = require('./persist_module');

// POST /checkout – מבצע רכישה מדומה
router.post('/checkout', async (req, res) => {
  try {
    const username = req.cookies.username;
    if (!username) return res.status(401).send('Not logged in');

    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).send('No items provided');
    }

    // Validate that all items are strings/numbers
    const validItems = items.filter(id => id !== null && id !== undefined && String(id).trim() !== '');
    if (validItems.length === 0) {
      return res.status(400).send('No valid items provided');
    }

    // Load products to verify items
    const allProducts = await persist.readJSON('products.json');
    const timestamp = new Date().toISOString();

    // Verify that at least some items exist in products
    const existingItems = validItems.filter(id => allProducts[id]);
    if (existingItems.length === 0) {
      return res.status(400).send('No valid products found in cart');
    }

    // old system: update carts.json and purchases.json
    const carts = await persist.readJSON('carts.json');
    carts[username] = (carts[username] || []).filter(id => !validItems.includes(id));
    await persist.writeJSON('carts.json', carts);

    // new system: update user's cart.json and purchases.json
    const userCart = await persist.readUserFile(username, 'cart.json');
    userCart.items = (userCart.items || []).filter(id => !validItems.includes(id));
    await persist.writeUserFile(username, 'cart.json', userCart);


    // old system: purchases.json
    const purchases = await persist.readJSON('purchases.json');
    if (!purchases[username]) purchases[username] = [];

    let totalAmount = 0;
    existingItems.forEach(id => {
      const product = allProducts[id];
      if (product) {
        purchases[username].push({
          ...product,
          productId: id,
          quantity: 1,
          purchasedAt: timestamp
        });
        totalAmount += product.price || 0;
      }
    });

    await persist.writeJSON('purchases.json', purchases);

    // new system: purchases.json per user
    const userPurchases = await persist.readUserFile(username, 'purchases.json');
    if (!Array.isArray(userPurchases.items)) userPurchases.items = [];

    existingItems.forEach(id => {
      userPurchases.items.push({
        id,
        purchasedAt: timestamp
      });
    });

    await persist.writeUserFile(username, 'purchases.json', userPurchases);


    // Log activity
    await persist.appendActivity({ username, type: 'checkout' });

    res.json({
      message: 'Payment processed successfully (fake)',
      itemsPurchased: existingItems.length,
      totalAmount: totalAmount.toFixed(2)
    });
  } catch (error) {
    console.error('Error processing checkout:', error);
    res.status(500).send('Internal server error during checkout');
  }
});

module.exports = router;
