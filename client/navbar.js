const nav = document.createElement('div');
nav.className = 'nav-bar';

nav.innerHTML = `
  <div class="nav-left">
    <a href="store.html">🏬 Store</a>
    <a href="cart.html">🛒 Cart</a>
    <a href="checkout.html">✅ Checkout</a>
    <a href="myitems.html">📦 My Items</a>
  </div>
  <div class="nav-right">
    <span id="welcome-user"></span>
    <button id="logout-btn">Logout</button>
  </div>
`;

document.body.prepend(nav);

// הטמעת שם משתמש וכפתור logout רק אם יש משתמש מחובר
const username = document.cookie
  .split('; ')
  .find(row => row.startsWith('username='))
  ?.split('=')[1];

const logoutBtn = document.getElementById('logout-btn');
const welcomeSpan = document.getElementById('welcome-user');
const currentPage = window.location.pathname;

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
