const nav = document.createElement('div');
nav.className = 'nav-bar';

const username = document.cookie
  .split('; ')
  .find(row => row.startsWith('username='))
  ?.split('=')[1];

const currentPage = window.location.pathname;

// Function to get cart count
async function getCartCount() {
  if (!username) return 0;
  
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

// Function to update cart count display
async function updateCartDisplay() {
  const cartCount = await getCartCount();
  const cartLink = document.querySelector('a[href="cart.html"]');
  
  if (cartLink) {
    if (cartCount > 0) {
      cartLink.innerHTML = `🛒 Cart (${cartCount})`;
    } else {
      cartLink.innerHTML = '🛒 Cart';
    }
  }
}

// צד שמאל של הסרגל (קישורים קבועים)
let leftNavHTML = `
  <a href="store.html">🏬 Store</a>
  <a href="cart.html" id="cart-link">🛒 Cart</a>
  <a href="checkout.html">✅ Checkout</a>
  <a href="myitems.html">📦 My Items</a>
`;

if (username === 'admin') {
  leftNavHTML += `<a href="admin.html">🔧 Admin</a>`;
}

// צד ימין של הסרגל – דינמי
let rightNavHTML = '';

if (username && !currentPage.includes('login') && !currentPage.includes('register')) {
  const formattedName = username === 'admin' ? 'Admin 👑' : username;
  rightNavHTML = `
    <span id="welcome-user">Welcome, ${formattedName}!</span>
    <button id="logout-btn">Logout</button>
  `;
} else {
  rightNavHTML = `
    <a href="login.html" id="login-link">🔑 Login</a>
    <a href="register.html" id="register-link">📝 Register</a>
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

document.body.prepend(nav); // הכנסת הסרגל לדף

// הפעלת כפתור logout אם יש
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.onclick = async () => {
    await fetch('/logout', { method: 'POST' });
    document.cookie = "username=; Max-Age=0; path=/";
    window.location.href = 'login.html';
  };
}

// Update cart count when page loads
if (username) {
  // Wait a bit for the page to load completely
  setTimeout(updateCartDisplay, 100);
  
  // Also update cart count every 30 seconds
  setInterval(updateCartDisplay, 30000);
}

// Function to manually update cart count (can be called from other pages)
window.updateCartCount = updateCartDisplay;

// Listen for cart updates (can be triggered from store page)
window.addEventListener('cartUpdated', updateCartDisplay);