const express = require('express');
const router = express.Router();
const persist = require('./persist_module');

// GET /reviews - Get all product reviews
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await persist.readJSON('reviews.json');
    const reviewsArray = Object.values(reviews).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    res.json(reviewsArray);
  } catch (error) {
    console.error('Error loading reviews:', error);
    res.status(500).send('Failed to load reviews');
  }
});

// POST /reviews - Submit a new review
router.post('/reviews', async (req, res) => {
  const username = req.cookies.username;
  if (!username) return res.status(401).send('You must be logged in to write reviews');

  try {
    const { productId, rating, title, review } = req.body;

    // Validate required fields
    if (!productId || !rating || !title || !review) {
      return res.status(400).send('All fields are required');
    }

    // Validate rating
    const ratingNum = parseInt(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      return res.status(400).send('Rating must be between 1 and 5');
    }

    // Verify product exists
    const products = await persist.readJSON('products.json');
    if (!products[productId]) {
      return res.status(404).send('Product not found');
    }

    // Check if user already reviewed this product
    const reviews = await persist.readJSON('reviews.json');
    const existingReview = Object.values(reviews).find(r => 
      r.username === username && r.productId === productId
    );

    if (existingReview) {
      return res.status(400).send('You have already reviewed this product');
    }

    // Create review
    const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newReview = {
      id: reviewId,
      productId,
      username,
      rating: ratingNum,
      title: title.trim(),
      review: review.trim(),
      likes: 0,
      reports: 0,
      createdAt: new Date().toISOString()
    };

    reviews[reviewId] = newReview;
    await persist.writeJSON('reviews.json', reviews);

    // Update user's review history
    const userReviews = await persist.readUserFile(username, 'reviews.json');
    if (!Array.isArray(userReviews.items)) userReviews.items = [];
    userReviews.items.push({
      reviewId,
      productId,
      rating: ratingNum,
      createdAt: newReview.createdAt
    });
    await persist.writeUserFile(username, 'reviews.json', userReviews);

    // Log activity
    await persist.appendActivity({ username, type: 'review-submit' });

    res.json(newReview);
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).send('Failed to submit review');
  }
});

// POST /reviews/:id/like - Like a review
router.post('/reviews/:id/like', async (req, res) => {
  const username = req.cookies.username;
  if (!username) return res.status(401).send('You must be logged in to like reviews');

  try {
    const reviewId = req.params.id;
    const reviews = await persist.readJSON('reviews.json');
    
    if (!reviews[reviewId]) {
      return res.status(404).send('Review not found');
    }

    // Check if user already liked this review
    const userLikes = await persist.readUserFile(username, 'review-likes.json');
    if (!Array.isArray(userLikes.items)) userLikes.items = [];

    const alreadyLiked = userLikes.items.includes(reviewId);
    
    if (alreadyLiked) {
      // Unlike
      reviews[reviewId].likes = Math.max(0, (reviews[reviewId].likes || 0) - 1);
      userLikes.items = userLikes.items.filter(id => id !== reviewId);
    } else {
      // Like
      reviews[reviewId].likes = (reviews[reviewId].likes || 0) + 1;
      userLikes.items.push(reviewId);
    }

    await persist.writeJSON('reviews.json', reviews);
    await persist.writeUserFile(username, 'review-likes.json', userLikes);

    res.json({ 
      likes: reviews[reviewId].likes,
      userLiked: !alreadyLiked
    });
  } catch (error) {
    console.error('Error liking review:', error);
    res.status(500).send('Failed to like review');
  }
});

// POST /reviews/:id/report - Report a review
router.post('/reviews/:id/report', async (req, res) => {
  const username = req.cookies.username;
  if (!username) return res.status(401).send('You must be logged in to report reviews');

  try {
    const reviewId = req.params.id;
    const reviews = await persist.readJSON('reviews.json');
    
    if (!reviews[reviewId]) {
      return res.status(404).send('Review not found');
    }

    // Check if user already reported this review
    const userReports = await persist.readUserFile(username, 'review-reports.json');
    if (!Array.isArray(userReports.items)) userReports.items = [];

    if (userReports.items.includes(reviewId)) {
      return res.status(400).send('You have already reported this review');
    }

    // Add report
    reviews[reviewId].reports = (reviews[reviewId].reports || 0) + 1;
    userReports.items.push(reviewId);

    await persist.writeJSON('reviews.json', reviews);
    await persist.writeUserFile(username, 'review-reports.json', userReports);

    // Log activity
    await persist.appendActivity({ username, type: 'review-report' });

    // Auto-hide review if too many reports
    if (reviews[reviewId].reports >= 5) {
      reviews[reviewId].hidden = true;
      await persist.writeJSON('reviews.json', reviews);
    }

    res.send('Review reported successfully');
  } catch (error) {
    console.error('Error reporting review:', error);
    res.status(500).send('Failed to report review');
  }
});

// GET /reviews/product/:productId - Get reviews for specific product
router.get('/reviews/product/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const reviews = await persist.readJSON('reviews.json');
    
    const productReviews = Object.values(reviews)
      .filter(review => review.productId === productId && !review.hidden)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(productReviews);
  } catch (error) {
    console.error('Error loading product reviews:', error);
    res.status(500).send('Failed to load product reviews');
  }
});

// GET /reviews/stats - Get review statistics
router.get('/reviews/stats', async (req, res) => {
  try {
    const reviews = await persist.readJSON('reviews.json');
    const reviewsArray = Object.values(reviews).filter(r => !r.hidden);
    
    const totalReviews = reviewsArray.length;
    const averageRating = totalReviews > 0 ? 
      (reviewsArray.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) : '0.0';
    
    const ratingDistribution = {
      5: reviewsArray.filter(r => r.rating === 5).length,
      4: reviewsArray.filter(r => r.rating === 4).length,
      3: reviewsArray.filter(r => r.rating === 3).length,
      2: reviewsArray.filter(r => r.rating === 2).length,
      1: reviewsArray.filter(r => r.rating === 1).length
    };

    res.json({
      totalReviews,
      averageRating: parseFloat(averageRating),
      ratingDistribution
    });
  } catch (error) {
    console.error('Error loading review stats:', error);
    res.status(500).send('Failed to load review statistics');
  }
});

module.exports = router;