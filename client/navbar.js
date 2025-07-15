// נכניס את התפריט לראש הדף
const nav = document.createElement('div');
nav.className = 'nav-bar';

const currentPage = window.location.pathname;

let html = `
  <a href="store.html">🏬 Store</a>
  <a href="cart.html">🛒 Cart</a>
  <a href="checkout.html">✅ Checkout</a>
  <a href="myitems.html">📦 My Items</a>
`;

if (!currentPage.includes('login') && !currentPage.includes('register')) {
  html += `<button onclick="logout()">Logout</button>`;
}

nav.innerHTML = html;

// הצגת Welcome עם שם משתמש
const username = document.cookie
  .split('; ')
  .find(row => row.startsWith('username='))
  ?.split('=')[1];

if (username) {
  const welcome = document.createElement('span');
  welcome.style.marginLeft = 'auto';
  welcome.style.color = 'white';
  welcome.textContent = `Welcome, ${username}`;
  nav.appendChild(welcome);
}

document.body.prepend(nav);

// פונקציית logout
async function logout() {
  await fetch('/logout', { method: 'POST' });
  document.cookie = "username=; Max-Age=0; path=/";
  window.location.href = 'login.html';
}
