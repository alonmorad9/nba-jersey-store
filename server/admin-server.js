const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const persist = require('./persist_module');

// קובץ הפעילות
const ACTIVITY_FILE = path.join(__dirname, '../data/activity.json');

// שלב 1+2: הצגת פעילות עם סינון לפי prefix
router.get('/admin-activity', async (req, res) => {
  try {
    const prefix = (req.query.prefix || '').toLowerCase();

    const data = await fs.readFile(ACTIVITY_FILE, 'utf-8');
    let activity = JSON.parse(data);

    if (prefix) {
      activity = activity.filter(
        a => a.username && a.username.toLowerCase().startsWith(prefix)
      );
    }

    res.json(activity);
  } catch (err) {
    console.error('Error reading activity file:', err);
    res.json([]);
  }
});

// שלב 3a: קבלת כל המוצרים
router.get('/admin-products', async (req, res) => {
  const products = await persist.readJSON('products.json');
  res.json(Object.values(products));
});

// שלב 3b: הוספת מוצר
router.post('/admin-add-product', async (req, res) => {
  const { name, description, price, image } = req.body;

  if (!name || !description || !price) {
    return res.status(400).send('Missing fields');
  }

  const products = await persist.readJSON('products.json');
  const newId = (Math.max(0, ...Object.keys(products).map(Number)) + 1).toString();

  products[newId] = {
    id: newId,
    name,
    description,
    price: parseFloat(price),
    image: image || ''
  };

  await persist.writeJSON('products.json', products);
  res.send('Product added');
});

// שלב 3c: מחיקת מוצר
router.post('/admin-remove-product', async (req, res) => {
  const { id } = req.body;
  const products = await persist.readJSON('products.json');

  if (!products[id]) {
    return res.status(404).send('Product not found');
  }

  delete products[id];
  await persist.writeJSON('products.json', products);
  res.send('Product removed');
});

module.exports = router;
