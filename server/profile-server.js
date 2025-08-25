const express = require('express');
const router = express.Router();
const persist = require('./persist_module');

// GET /profile - Get user profile information
router.get('/profile', async (req, res) => {
  const username = req.cookies.username;
  if (!username) return res.status(401).send('Not logged in');

  try {
    // Get user data
    const users = await persist.readJSON('users.json');
    const userProfile = await persist.readUserFile(username, 'profile.json');
    
    // Get purchase statistics
    const purchases = await persist.readJSON('purchases.json');
    const userPurchases = purchases[username] || [];
    
    // Calculate stats
    const totalOrders = userPurchases.length;
    const totalSpent = userPurchases.reduce((sum, purchase) => {
      return sum + (purchase.price || 0);
    }, 0);
    
    // Get member since date (from user activity)
    const userActivity = await persist.readUserFile(username, 'activity.json');
    const memberSince = userActivity && userActivity.length > 0 
      ? new Date(userActivity[0].datetime).getFullYear()
      : new Date().getFullYear();

    const profile = {
      username,
      email: userProfile.email || '',
      fullName: userProfile.fullName || '',
      phone: userProfile.phone || '',
      totalOrders,
      totalSpent: totalSpent.toFixed(2),
      memberSince
    };

    res.json(profile);
  } catch (error) {
    console.error('Error loading profile:', error);
    res.status(500).send('Failed to load profile');
  }
});

// PUT /profile - Update user profile information
router.put('/profile', async (req, res) => {
  const username = req.cookies.username;
  if (!username) return res.status(401).send('Not logged in');

  try {
    const { email, fullName, phone } = req.body;
    
    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).send('Invalid email format');
    }

    // Update profile data
    const profileData = {
      email: email || '',
      fullName: fullName || '',
      phone: phone || '',
      updatedAt: new Date().toISOString()
    };

    await persist.writeUserFile(username, 'profile.json', profileData);
    
    res.send('Profile updated successfully');
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).send('Failed to update profile');
  }
});

// POST /change-password - Change user password
router.post('/change-password', async (req, res) => {
  const username = req.cookies.username;
  if (!username) return res.status(401).send('Not logged in');

  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).send('Current and new passwords are required');
    }

    if (newPassword.length < 6) {
      return res.status(400).send('New password must be at least 6 characters long');
    }

    // Verify current password
    const users = await persist.readJSON('users.json');
    if (!users[username] || users[username].password !== currentPassword) {
      return res.status(401).send('Current password is incorrect');
    }

    // Update password
    users[username].password = newPassword;
    await persist.writeJSON('users.json', users);

    // Update user file
    await persist.writeUserFile(username, 'user.json', { password: newPassword });

    // Log password change activity
    await persist.appendActivity({ username, type: 'password-change' });

    res.send('Password changed successfully');
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).send('Failed to change password');
  }
});

// GET /export-data - Export user data
router.get('/export-data', async (req, res) => {
  const username = req.cookies.username;
  if (!username) return res.status(401).send('Not logged in');

  try {
    // Collect all user data
    const profile = await persist.readUserFile(username, 'profile.json');
    const cart = await persist.readUserFile(username, 'cart.json');
    const purchases = await persist.readUserFile(username, 'purchases.json');
    const activity = await persist.readUserFile(username, 'activity.json');

    const exportData = {
      username,
      profile,
      cart,
      purchases,
      activity,
      exportedAt: new Date().toISOString()
    };

    res.json(exportData);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).send('Failed to export data');
  }
});

module.exports = router;