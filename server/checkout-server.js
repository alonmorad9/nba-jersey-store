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

  // 1. קריאה וכתיבה ישנה – carts.json
  const carts = await persist.readJSON('carts.json');
  carts[username] = (carts[username] || []).filter(id => !items.includes(id));
  await persist.writeJSON('carts.json', carts);

  // 2. כתיבה חדשה – users/{username}/cart.json
  const userCart = await persist.readUserFile(username, 'cart.json');
  userCart.items = (userCart.items || []).filter(id => !items.includes(id));
  await persist.writeUserFile(username, 'cart.json', userCart);

  // 3. רכישות – ישן
  const purchases = await persist.readJSON('purchases.json');
  if (!purchases[username]) purchases[username] = [];
  purchases[username].push(...items);
  await persist.writeJSON('purchases.json', purchases);

  // 4. רכישות – חדש
  const userPurchases = await persist.readUserFile(username, 'purchases.json');
  if (!Array.isArray(userPurchases.items)) userPurchases.items = [];
  const timestamp = new Date().toISOString();

  items.forEach(id => {
    userPurchases.items.push({
      id,
      purchasedAt: timestamp
    });
  });

  await persist.writeUserFile(username, 'purchases.json', userPurchases);

  // 5. פעילות (כבר קיים בשיטה שלך או נוסיף אם תרצה)

  res.send('Payment processed successfully (fake)');
});

module.exports = router;
