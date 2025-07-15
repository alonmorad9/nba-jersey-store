// נכניס את התפריט לראש הדף
const nav = document.createElement('div');
nav.className = 'nav-bar';

// שליפת שם המשתמש מה-cookie
const username = document.cookie
  .split('; ')
  .find(row => row.startsWith('username='))
  ?.split('=')[1];


nav.innerHTML = `
  <a href="store.html">🏬 Store</a>
  <a href="cart.html">🛒 Cart</a>
  <a href="checkout.html">✅ Checkout</a>
  <a href="myitems.html">📦 My Items</a>
  <button onclick="logout()">Logout</button>
  <div class="nav-right">
    ${username ? `👋 Welcome, <strong>${username}</strong>` : ''}
  </div>
`;
document.body.prepend(nav);

// פונקציית logout – גרסה מעודכנת שתואמת לשרת
async function logout() {
  const res = await fetch('/logout', {
    method: 'POST'
  });
  if (res.ok) {
    window.location.href = 'login.html';
  } else {
    alert('Logout failed.');
  }
}
