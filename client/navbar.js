const nav = document.createElement('div');
nav.className = 'nav-bar';

const username = document.cookie
  .split('; ')
  .find(row => row.startsWith('username='))
  ?.split('=')[1];

const currentPage = window.location.pathname;

// נבנה את צד שמאל של הסרגל דינמית לפי המשתמש
let leftNavHTML = `
  <a href="store.html">🏬 Store</a>
  <a href="cart.html">🛒 Cart</a>
  <a href="checkout.html">✅ Checkout</a>
  <a href="myitems.html">📦 My Items</a>
`;

if (username === 'admin') {
  leftNavHTML += `<a href="admin.html">🔧 Admin</a>`;
}

nav.innerHTML = `
  <div class="nav-left">
    ${leftNavHTML}
  </div>
  <div class="nav-right">
    <span id="welcome-user"></span>
    <button id="logout-btn">Logout</button>
  </div>
`;

document.body.prepend(nav);

const logoutBtn = document.getElementById('logout-btn');
const welcomeSpan = document.getElementById('welcome-user');

if (username && !currentPage.includes('login') && !currentPage.includes('register')) {
  const formattedName = username === 'admin' ? 'Admin 👑' : username;
  welcomeSpan.textContent = `Welcome, ${formattedName}!`;
} else {
  logoutBtn.style.display = 'none';
  welcomeSpan.style.display = 'none';
}

// פעולה ללחיצה על logout
logoutBtn.onclick = async () => {
  await fetch('/logout', { method: 'POST' });
  document.cookie = "username=; Max-Age=0; path=/";
  window.location.href = 'login.html';
};
