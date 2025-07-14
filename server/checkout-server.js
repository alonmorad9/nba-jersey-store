const express = require('express');
const router = express.Router();
const persist = require('./persist_module');

// POST /checkout – מבצע רכישה מדומה
router.post('/checkout', async (req, res) => {
  const username = req.cookies.username;
  if (!username) return res.status(401).send('Not logged in');

  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).send('No items provided');
  }

  const carts = await persist.readJSON('carts.json');
  const purchases = await persist.readJSON('purchases.json');
  const products = await persist.readJSON('products.json');
  const now = new Date().toISOString();

  // הסרה מהעגלה
  carts[username] = (carts[username] || []).filter(id => !items.includes(id));

  // יצירת אובייקטי רכישה מפורטים לפי products.json
  const detailedPurchases = items
    .map(id => {
      const product = products[id];
      if (!product) return null;
      return {
        ...product,
        productId: id,
        quantity: 1,
        purchasedAt: now
      };
    })
    .filter(Boolean);

  // הוספה לרשימת הרכישות
  if (!purchases[username]) purchases[username] = [];
  purchases[username].push(...detailedPurchases);

  await persist.writeJSON('carts.json', carts);
  await persist.writeJSON('purchases.json', purchases);

  res.send('Payment processed successfully (fake)');
});

module.exports = router;
כן