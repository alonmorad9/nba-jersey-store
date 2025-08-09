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

async function updateCartDisplay() {
  const cartCount = await getCartCount();
  const cartLink = document.querySelector('a[href="cart.html"]');
  if (cartLink) {
    cartLink.innerHTML = cartCount > 0 ? `🛒 Cart (${cartCount})` : '🛒 Cart';
  }
}

// צד שמאל
let leftNavHTML = `
  <a href="store.html">🏬 Store</a>
  <a href="cart.html" id="cart-link">🛒 Cart</a>
  <a href="checkout.html">✅ Checkout</a>
  <a href="myitems.html">📦 My Items</a>
`;
if (username === 'admin') {
  leftNavHTML += `<a href="admin.html">🔧 Admin</a>`;
}

// צד ימין
let rightNavHTML = '';
if (username && !currentPage.includes('login') && !currentPage.includes('register')) {
  const formattedName = username === 'admin' ? 'Admin 👑' : username;
  rightNavHTML = `
    <span id="welcome-user">Welcome, ${formattedName}!</span>
    <button id="logout-btn">Logout</button>
    <button id="darkToggleBtn" class="dark-toggle-btn">🌙</button>
  `;
} else {
  // הוספת כפתור Dark Mode גם לעמודי login ו-register
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

document.body.prepend(nav);

// עיצוב הכפתור
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
  }
  
  .dark-toggle-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }
`;
document.head.appendChild(darkToggleStyle);

// הפעלת logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.onclick = async () => {
    await fetch('/logout', { method: 'POST' });
    document.cookie = "username=; Max-Age=0; path=/";
    window.location.href = 'login.html';
  };
}

// Toggle Dark Mode
function applyDarkModeFromStorage() {
  const isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) document.body.classList.add('dark-mode');
  const toggleBtn = document.getElementById('darkToggleBtn');
  if (toggleBtn) toggleBtn.textContent = isDark ? '☀️' : '🌙';
}
applyDarkModeFromStorage();

document.addEventListener('click', (e) => {
  if (e.target.id === 'darkToggleBtn') {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark ? 'true' : 'false');
    e.target.textContent = isDark ? '☀️' : '🌙';
  }
});

// Cart count
if (username) {
  setTimeout(updateCartDisplay, 100);
  setInterval(updateCartDisplay, 30000);
}
window.updateCartCount = updateCartDisplay;
window.addEventListener('cartUpdated', updateCartDisplay);