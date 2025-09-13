const express = require('express');
const router = express.Router();
const persist = require('./persist_module');

// GET /my-items - returns all purchases of the logged-in user
router.get('/my-items', async (req, res) => {
  const username = req.cookies.username;
  if (!username) return res.status(401).send('Not logged in');

  try {
    const purchases = await persist.readJSON('purchases.json');
    const allProducts = await persist.readJSON('products.json');
    const userPurchases = purchases[username] || [];

    const grouped = {};

    for (const p of userPurchases) {
      let productId, purchasedAt;


      // support both old and new formats
      if (typeof p === 'string') {
        productId = p;
        purchasedAt = new Date().toISOString(); // if no date is available, use now
      } else {
        productId = p.productId || p.id;
        purchasedAt = p.purchasedAt || new Date().toISOString();
      }

      const product = allProducts[productId];
      if (!product) continue;

      if (!grouped[productId]) {
        grouped[productId] = {
          ...product,
          quantity: 1,
          purchasedAt: purchasedAt,
          firstPurchaseAt: purchasedAt,
          purchaseDates: [purchasedAt] // Array of all purchase dates
        };
      } else {
        grouped[productId].quantity++;
        grouped[productId].purchaseDates.push(purchasedAt);
        
        // Update last purchase date
        if (new Date(purchasedAt) > new Date(grouped[productId].purchasedAt)) {
          grouped[productId].purchasedAt = purchasedAt;
        }
        
        // Save first purchase date
        if (new Date(purchasedAt) < new Date(grouped[productId].firstPurchaseAt)) {
          grouped[productId].firstPurchaseAt = purchasedAt;
        }
      }
    }

    // Sort purchase dates within each product
    Object.values(grouped).forEach(item => {
      item.purchaseDates.sort((a, b) => new Date(b) - new Date(a)); // Sort from latest to earliest
    });

    res.json(Object.values(grouped));
  } catch (err) {
    console.error('Error loading my items:', err);
    res.status(500).send('Could not load purchases');
  }
});

module.exports = router;