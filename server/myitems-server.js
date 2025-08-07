const express = require('express');
const router = express.Router();
const persist = require('./persist_module');

// GET /my-items – מחזיר את כל הרכישות של המשתמש המחובר
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

      // תמיכה גם באובייקטים וגם במחרוזות מזהה פשוטות
      if (typeof p === 'string') {
        productId = p;
        purchasedAt = new Date().toISOString(); // אם אין תאריך, נשתמש בתאריך נוכחי
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
          purchaseDates: [purchasedAt] // מערך של כל תאריכי הרכישה
        };
      } else {
        grouped[productId].quantity++;
        grouped[productId].purchaseDates.push(purchasedAt);
        
        // עדכון תאריך הרכישה האחרונה
        if (new Date(purchasedAt) > new Date(grouped[productId].purchasedAt)) {
          grouped[productId].purchasedAt = purchasedAt;
        }
        
        // שמירת תאריך הרכישה הראשונה
        if (new Date(purchasedAt) < new Date(grouped[productId].firstPurchaseAt)) {
          grouped[productId].firstPurchaseAt = purchasedAt;
        }
      }
    }

    // מיון תאריכי הרכישה בתוך כל מוצר
    Object.values(grouped).forEach(item => {
      item.purchaseDates.sort((a, b) => new Date(b) - new Date(a)); // מיון מהאחרון לראשון
    });

    res.json(Object.values(grouped));
  } catch (err) {
    console.error('Error loading my items:', err);
    res.status(500).send('Could not load purchases');
  }
});

module.exports = router;