const express = require('express');
const router = express.Router();
const persist = require('./persist_module');

// GET /cart – מחזיר את כל המוצרים שבעגלת המשתמש
router.get('/cart', async (req, res) => {
  const username = req.cookies.username;
  if (!username) return res.status(401).send('Not logged in');

  const carts = await persist.readJSON('carts.json');
  const products = await persist.readJSON('products.json');

  const cartItems = (carts[username] || []).map(id => products[id]).filter(Boolean);
  res.json(cartItems);
});

// POST /remove-from-cart – מסיר מוצר מהעגלה לפי productId
router.post('/remove-from-cart', async (req, res) => {
  const username = req.cookies.username;
  if (!username) return res.status(401).send('Not logged in');

  const { productId } = req.body;
  const carts = await persist.readJSON('carts.json');

  if (!Array.isArray(carts[username])) {
    return res.status(400).send('Cart not found');
  }

  // מסיר מופע אחד של המוצר מהעגלה (אם יש כפילויות)
  carts[username] = carts[username].filter(id => id !== productId);
  await persist.writeJSON('carts.json', carts);

  res.send('Item removed');
});

module.exports = router;
