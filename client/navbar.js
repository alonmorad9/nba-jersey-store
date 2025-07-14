// נכניס את התפריט לראש הדף
const nav = document.createElement('div');
nav.className = 'nav-bar';
nav.innerHTML = `
  <a href="store.html">🏬 Store</a>
  <a href="cart.html">🛒 Cart</a>
  <a href="checkout.html">✅ Checkout</a>
  <a href="myitems.html">📦 My Items</a>
  <button onclick="logout()">Logout</button>
`;
document.body.prepend(nav);

// פונקציית logout
async function logout() {
  await fetch('/logout');
  window.location.href = 'login.html';
}
