const nav = document.createElement('div');
nav.className = 'nav-bar';

// Get username from cookies
const username = document.cookie
  .split('; ')
  .find(row => row.startsWith('username='))
  ?.split('=')[1];

  // Get current page
const currentPage = window.location.pathname;

// Function to get cart count
async function getCartCount() {
  if (!username) return 0;

  // Get cart count from server
  try {
    const res = await fetch('/cart');
    if (res.ok) {
      const cartItems = await res.json();
      return cartItems.length;
    }
  } catch (error) {
    console.error('Failed to get cart count:', error);
  }
  return 0;
}

// Function to get wishlist count
async function getWishlistCount() {
  if (!username) return 0;

  try {
    const res = await fetch('/wishlist');
    if (res.ok) {
      const wishlistItems = await res.json();
      return wishlistItems.length;
    }
  } catch (error) {
    console.error('Failed to get wishlist count:', error);
  }
  return 0;
}

// Update cart display
async function updateCartDisplay() {
  const cartCount = await getCartCount();
  const cartLink = document.querySelector('a[href="cart.html"]');
  if (cartLink) { // Update cart link text
    cartLink.innerHTML = cartCount > 0 ? `🛒 Cart (${cartCount})` : '🛒 Cart';
  }
}

// Update wishlist display
async function updateWishlistDisplay() {
  const wishlistCount = await getWishlistCount();
  const wishlistLink = document.querySelector('a[href="wishlist.html"]');
  if (wishlistLink) { // Update wishlist link text
    wishlistLink.innerHTML = wishlistCount > 0 ? `💖 Wishlist (${wishlistCount})` : '💖 Wishlist';
  }
}

// Check if user is on a protected page without being logged in
function checkAuthentication() {
  const protectedPages = [
    'cart.html', 'checkout.html', 'myitems.html', 'admin.html', 
    'profile.html', 'wishlist.html', 'reviews.html', 'contact.html'
  ];

  // Get current page
  const currentPageFile = window.location.pathname.split('/').pop();

  // Check if user is on a protected page without being logged in
  if (!username && protectedPages.includes(currentPageFile)) {
    alert('You must be logged in to access this page.');
    window.location.href = 'login.html';
    return false;
  }
  
  return true;
}

// Left navigation (authenticated users only)
let leftNavHTML = '';
if (username) {
  leftNavHTML = `
    <a href="store.html">🏬 Store</a>
    <a href="wishlist.html" id="wishlist-link">💖 Wishlist</a>
    <a href="cart.html" id="cart-link">🛒 Cart</a>
    <a href="checkout.html">✅ Checkout</a>
    <a href="profile.html">👤 Profile</a>
    <a href="myitems.html">📦 My Items</a>
    <a href="reviews.html">⭐ Reviews</a>
    <a href="contact.html">✉️ Contact</a>
    <a href="README.html">❓ Readme</a>
    <a href="LLM.html">💻 LLM</a>
  `;
  
  // Add admin link for admin users
  if (username === 'admin') {
    leftNavHTML += `<a href="admin.html">🔧 Admin</a>`;
  }

  // Public pages (non-authenticated users)
} else {
  leftNavHTML = `
    <a href="store.html">🏬 Store</a>
    <a href="README.html">❓ Readme</a>
    <a href="LLM.html">💻 LLM</a>
  `;
}

// Right navigation - Authenticated users
let rightNavHTML = '';
if (username && !currentPage.includes('login') && !currentPage.includes('register')) {
  const formattedName = username === 'admin' ? 'Admin 👑' : username;
  rightNavHTML = `
    <span id="welcome-user">Welcome, ${formattedName}!</span>
    <button id="logout-btn">Logout</button>
    <button id="darkToggleBtn" class="dark-toggle-btn">🌙</button>
  `;
} else {
  // Login/Register links for non-authenticated users
  rightNavHTML = `
    <a href="login.html" id="login-link">🔑 Login</a>
    <a href="register.html" id="register-link">📝 Register</a>
    <button id="darkToggleBtn" class="dark-toggle-btn">🌙</button>
  `;
}

nav.innerHTML = `
  <div class="nav-left">
    ${leftNavHTML}
  </div>
  <div class="nav-right">
    ${rightNavHTML}
  </div>
`;

// Prepend the navigation bar to the body
document.body.prepend(nav);

// Dark mode toggle button styling
const darkToggleStyle = document.createElement('style');
darkToggleStyle.textContent = `
  .dark-toggle-btn {
    margin-left: 10px;
    font-size: 1.2em;
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    border-radius: 50%;
    padding: 8px;
    color: white;
  }
  
  .dark-toggle-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }

  /* Enhanced navigation styling */
  .nav-bar a {
    position: relative;
    color: white !important;
    text-decoration: none;
    font-weight: 500;
    padding: 8px 16px;
    border-radius: 25px;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .nav-bar a::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.2);
    transition: left 0.3s ease;
  }

  .nav-bar a:hover::before {
    left: 0;
  }

  .nav-bar a:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  /* Consistent styling for all navigation links */
  .nav-bar a {
    background: none !important;
    border: none !important;
  }

  .nav-bar a:hover {
    background: rgba(255, 255, 255, 0.1) !important;
  }

  /* Ensure all navigation items have consistent appearance */
  .nav-bar .nav-left a,
  .nav-bar .nav-right a {
    color: white !important;
    text-decoration: none !important;
    font-weight: 500 !important;
    padding: 8px 16px !important;
    border-radius: 25px !important;
    transition: all 0.3s ease !important;
    background: none !important;
    border: none !important;
  }
`;

// Append the dark mode toggle button styling to the document head
document.head.appendChild(darkToggleStyle);

// Handle logout functionality
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.onclick = async () => {
    try {
      // Send logout request to server
      await fetch('/logout', { method: 'POST' });
      // Clear user cookie
      document.cookie = "username=; Max-Age=0; path=/";
      
      // Clear any cached data
      localStorage.removeItem('cartCount');
      localStorage.removeItem('wishlistCount');
      
      // Redirect to login page
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Error during logout:', error);
      // Force logout even if server request fails
      // cookie cleanup
      document.cookie = "username=; Max-Age=0; path=/";
      window.location.href = 'login.html';
    }
  };
}

// Dark Mode functionality - Apply saved preference
function applyDarkModeFromStorage() {
  const isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) document.body.classList.add('dark-mode');
  const toggleBtn = document.getElementById('darkToggleBtn');
  if (toggleBtn) toggleBtn.textContent = isDark ? '☀️' : '🌙';
}
applyDarkModeFromStorage();

// Dark mode toggle button functionality
document.addEventListener('click', (e) => {
  if (e.target.id === 'darkToggleBtn') {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark ? 'true' : 'false');
    e.target.textContent = isDark ? '☀️' : '🌙';
  }
});

// Authentication check on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAuthentication();
});

// Update cart and wishlist counts for authenticated users
if (username) {
  // Initial load
  setTimeout(() => {
    updateCartDisplay();
    updateWishlistDisplay();
  }, 100); // slight delay to ensure DOM is ready
  
  // Periodic updates
  setInterval(() => {
    updateCartDisplay();
    updateWishlistDisplay();
  }, 30000); // Update every 30 seconds
}

// Global functions for updating counts
window.updateCartCount = updateCartDisplay;
window.updateWishlistCount = updateWishlistDisplay;

// Event listeners for count updates
window.addEventListener('cartUpdated', updateCartDisplay);
window.addEventListener('wishlistUpdated', updateWishlistDisplay);

// Navigation click handlers with authentication checks
document.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    const href = e.target.getAttribute('href');
    const protectedPages = [
      'cart.html', 'checkout.html', 'myitems.html', 'admin.html',
      'profile.html', 'wishlist.html', 'contact.html'
    ];

    // Redirect to login if not authenticated
    if (!username && protectedPages.includes(href)) {
      e.preventDefault();
      alert('You must be logged in to access this page.');
      window.location.href = 'login.html';
      return false;
    }
    
    // Special handling for admin page
    if (href === 'admin.html' && username !== 'admin') {
      e.preventDefault();
      alert('Admin access required.');
      return false;
    }
  }
});

// Add wishlist functionality to store pages
window.addToWishlist = async function(productId) {
  if (!username) {
    alert('You must be logged in to add items to your wishlist.');
    window.location.href = 'login.html';
    return;
  }

  // Add item to wishlist
  try {
    const response = await fetch('/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    });

    if (response.ok) {
      // Show success message
      const button = event.target;
      const originalText = button.innerHTML;
      button.innerHTML = '💖 Added!';
      button.style.background = '#28a745';
      
      // Update wishlist count
      updateWishlistDisplay();
      
      // Trigger wishlist updated event
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
      
      // Reset button after 2 seconds
      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.background = '';
      }, 2000);
      
    } else {
      const error = await response.text();
      alert(error);
    }
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    alert('Failed to add item to wishlist');
  }
};

// Console log for debugging
console.log('🚀 NBA Thread Navigation loaded');
console.log(`👤 User: ${username || 'Not logged in'}`);
console.log(`📄 Current page: ${currentPage}`);
if (username) {
  console.log('🔗 Available pages: Store, Cart, Wishlist, Checkout, My Items, Profile, Reviews, Contact' + (username === 'admin' ? ', Admin' : ''));
} else {
  console.log('🔗 Available pages: Store, Reviews, Contact, About (Login required for other pages)');
}