const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const persist = require('./persist_module');

// activity.json global path
const ACTIVITY_FILE = path.join(__dirname, '../data/activity.json');

// gets all activities, with optional username prefix filter
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
    res.status(500).json({ error: 'Failed to load activity data' });
  }
});

// gets all products, with optional name prefix filter
router.get('/admin-products', async (req, res) => {
  try {
    const products = await persist.readJSON('products.json');
    res.json(Object.values(products));
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

// adds a new product
router.post('/admin-add-product', async (req, res) => {
  try {
    const { name, description, price, image } = req.body;

    if (!name || !description || !price) {
      return res.status(400).json({ error: 'Missing required fields: name, description, price' });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    const products = await persist.readJSON('products.json');
    const existingIds = Object.keys(products).map(Number).filter(id => !isNaN(id));
    const newId = (Math.max(0, ...existingIds) + 1).toString();

    products[newId] = {
      id: newId,
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      image: image ? image.trim() : ''
    };

    await persist.writeJSON('products.json', products);
    res.json({ message: 'Product added successfully', product: products[newId] });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: 'Failed to add product' });
  }
});

// removes a product by ID by post
// router.post('/admin-remove-product', async (req, res) => {
//   try {
//     const { id } = req.body;
    
//     if (!id) {
//       return res.status(400).json({ error: 'Product ID is required' });
//     }
    
//     const products = await persist.readJSON('products.json');

//     if (!products[id]) {
//       return res.status(404).json({ error: 'Product not found' });
//     }

//     const deletedProduct = products[id];
//     delete products[id];
//     await persist.writeJSON('products.json', products);
//     res.json({ message: 'Product removed successfully', deletedProduct });
//   } catch (error) {
//     console.error('Error removing product:', error);
//     res.status(500).json({ error: 'Failed to remove product' });
//   }
// });

// removes a product by ID by delete
router.delete('/admin-products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }
    
    const products = await persist.readJSON('products.json');

    if (!products[id]) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const deletedProduct = products[id];
    delete products[id];
    await persist.writeJSON('products.json', products);
    
    res.json({ 
      message: 'Product deleted successfully', 
      deletedProduct: deletedProduct 
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
