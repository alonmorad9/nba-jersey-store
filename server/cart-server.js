const express = require('express');
const router = express.Router();
const persist = require('./persist_module');

// GET /cart – מחזיר מוצרים שבעגלת המשתמש
router.get('/cart', async (req, res) => {
  const username = req.cookies.username;
  if (!username) return res.status(401).send('Not logged in');

  const carts = await persist.readJSON('carts.json');
  const products = await persist.readJSON('products.json');

  const cartItems = (carts[username] || []).map(id => products[id]).filter(Boolean);
  res.json(cartItems);
});

// POST /remove-from-cart – מסיר כמות ספציפית או עותק אחד מהמוצר
router.post('/remove-from-cart', async (req, res) => {
  const username = req.cookies.username;
  if (!username) return res.status(401).send('Not logged in');

  const { productId, quantity } = req.body;
  const qty = parseInt(quantity) || 1;

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
});


// POST /remove-all-from-cart – מסיר את כל המופעים של מוצר מהעגלה
router.post('/remove-all-from-cart', async (req, res) => {
  const username = req.cookies.username;
  if (!username) return res.status(401).send('Not logged in');

  const productId = String(req.body.productId);
  const carts = await persist.readJSON('carts.json');

  if (!Array.isArray(carts[username])) {
    return res.status(400).send('Cart not found');
  }

  // הסרת כל המופעים של המוצר
  carts[username] = carts[username].filter(id => id !== productId);
  await persist.writeJSON('carts.json', carts);

  res.send('All items removed');
});


module.exports = router;
