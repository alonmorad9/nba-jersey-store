const express = require('express');
const router = express.Router();
const persist = require('./persist_module');

// GET /products – שולף את כל המוצרים
router.get('/products', async (req, res) => {
  const products = await persist.readJSON('products.json');
  res.json(Object.values(products)); // מחזיר מערך
});

// POST /add-to-cart – מוסיף מוצר לעגלה לפי משתמש מזוהה
router.post('/add-to-cart', async (req, res) => {
  const username = req.cookies.username;
  if (!username) return res.status(401).send('You must be logged in');

  const { productId, quantity } = req.body;
  const qty = parseInt(quantity) || 1;

  const carts = await persist.readJSON('carts.json');
  if (!carts[username]) carts[username] = [];

  // מוסיף את המוצר `qty` פעמים לעגלה
  for (let i = 0; i < qty; i++) {
    carts[username].push(productId);
  }

  await persist.writeJSON('carts.json', carts);
  res.send(`${qty} item(s) added to cart`);

  await persist.appendActivity({ username, type: 'add-to-cart' });
});


module.exports = router;
