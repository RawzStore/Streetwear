// Base de données produits
const products = [
  { 
    id: 1, 
    name: "Chemise à Carreaux", 
    category: "chemise", 
    price: 19.99, 
    sizes: ["S", "M", "L", "XL"],
    colors: ["Noir"],
    description: "Coupe ample à manches courtes, style vintage à carreaux brodés avec double poche.",
    mainImage: "images/chemise-devant.jpg",
    images: [
      "images/chemise-devant.jpg",
      "images/chemise-back.jpg",
      "images/chemise-zoom-logo-devant.jpg",
      "images/chemise-zoom-logo-back.jpg"
    ]
  },
  { 
    id: 2, 
    name: "Polo Rayures", 
    category: "polo", 
    price: 17.99, 
    sizes: ["S", "M", "L", "XL"],
    colors: ["Noir/Blanc", "Noir/Rose", "Blanc/Rouge", "Rouge/Blanc"],
    description: "Col en polyester élastique avec motif à rayures color-block et imprimé typographique.",
    mainImage: "images/polo-noir-r-blanches.jpg",
    imagesByColor: {
      "Noir/Blanc": [
        "images/polo-noir-r-blanches.jpg",
        "images/polo-noir-r-blanches-back.jpg"
      ],
      "Noir/Rose": [
        "images/polo-noir-r-roses.jpg",
        "images/polo-noir-r-roses-back.jpg"
      ],
      "Blanc/Rouge": [
        "images/polo-blanc-r-rouges.jpg",
        "images/polo-blanc-r-rouges-back.jpg"
      ],
      "Rouge/Blanc": [
        "images/polo-rouge-r-blanches.jpg",
        "images/polo-rouge-r-blanches-back.jpg"
      ]
    }
  },
  { 
    id: 3, 
    name: "Polo Baggy Court", 
    category: "polo", 
    price: 17.99, 
    sizes: ["S", "M", "L", "XL"],
    colors: ["Noir"],
    description: "Style : Streetwear | Matière : 100 % Coton | Col : Col rabattu | Coupe : Régulière",
    mainImage: "images/polo-signature.jpg",
    images: [
      "images/polo-signature.jpg",
      "images/polo-signature-zoom.jpg"
    ]
  },
  { 
    id: 4, 
    name: "T-Shirt Tricoté", 
    category: "tshirts", 
    price: 18.99, 
    sizes: ["S", "M", "L", "XL"],
    colors: ["Sable"],
    description: "T-Shirt Tricoté couleur sable / orange / blanc",
    mainImage: "images/tshirt-tricoté.jpg",
    images: [
      "images/tshirt-tricoté.jpg",
      "images/tshirt-tricoté-back.jpg"
    ]
  }
];

// État global du panier
window.cart = JSON.parse(localStorage.getItem('cart')) || [];
let appliedDiscount = 0;

// Éléments DOM
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const cartBadge = document.getElementById('cart-badge');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');

const promoInput = document.getElementById('promo-input');
const applyPromoBtn = document.getElementById('apply-promo-btn');
const promoMsg = document.getElementById('promo-msg');
const themeToggleBtn = document.getElementById('theme-toggle-btn');

// Mode sombre
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    document.documentElement.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
  });
}

// Rendu du catalogue
function renderProducts(items) {
  const productGrid = document.getElementById('product-grid');
  if (!productGrid) return;
  
  productGrid.innerHTML = '';
  if (items.length === 0) {
    productGrid.innerHTML = '<p>Aucun produit trouvé.</p>';
    return;
  }
  
  items.forEach(product => {
    const card = document.createElement('article');
    card.className = 'product-card';

    card.innerHTML = `
      <a href="product.html?id=${product.id}" class="product-card-link">
        <div class="img-wrapper">
          <img src="${product.mainImage}" alt="${product.name}" class="product-img">
        </div>
        <div class="product-details">
          <h3 class="product-title">${product.name}</h3>
          <p class="product-price">${product.price.toFixed(2)} €</p>
        </div>
      </a>
    `;
    productGrid.appendChild(card);
  });
}

// Sauvegarde et mise à jour de l'affichage du panier
window.saveCart = function() {
  localStorage.setItem('cart', JSON.stringify(window.cart));
};

window.updateCartUI = function() {
  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = '';
  let subtotal = 0;
  let count = 0;

  window.cart.forEach(item => {
    subtotal += item.price * item.quantity;
    count += item.quantity;

    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <small>Taille: ${item.selectedSize} ${item.selectedColor ? '| Coloris: ' + item.selectedColor : ''}</small>
        <small>${(item.price * item.quantity).toFixed(2)} €</small>
        <div class="qty-controls">
          <button type="button" onclick="window.changeQuantity('${item.key}', -1)">-</button>
          <span>${item.quantity}</span>
          <button type="button" onclick="window.changeQuantity('${item.key}', 1)">+</button>
        </div>
      </div>
      <button type="button" class="delete-btn" onclick="window.removeFromCart('${item.key}')">✕</button>
    `;
    cartItemsContainer.appendChild(itemEl);
  });

  let finalTotal = subtotal * (1 - appliedDiscount);
  if (cartBadge) cartBadge.textContent = count;
  if (cartTotalPrice) cartTotalPrice.textContent = `${finalTotal.toFixed(2)} €`;
};

// Modification des quantités et suppression
window.changeQuantity = function(cartItemKey, delta) {
  const item = window.cart.find(i => i.key === cartItemKey);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    window.cart = window.cart.filter(i => i.key !== cartItemKey);
  }

  window.saveCart();
  window.updateCartUI();
};

window.removeFromCart = function(cartItemKey) {
  window.cart = window.cart.filter(item => item.key !== cartItemKey);
  window.saveCart();
  window.updateCartUI();
};

// Drawer Panier (Ouverture / Fermeture)
function openCart() {
  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('active');
  }
}

function closeCart() {
  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('active');
  }
}

if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCart);
if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

// Code Promo
if (applyPromoBtn) {
  applyPromoBtn.addEventListener('click', () => {
    const code = promoInput.value.trim().toUpperCase();
    if (code === "RAWZ10") {
      appliedDiscount = 0.10;
      promoMsg.textContent = "Code RAWZ10 appliqué (-10%) !";
      promoMsg.className = "promo-message success";
    } else {
      appliedDiscount = 0;
      promoMsg.textContent = "Code invalide.";
      promoMsg.className = "promo-message error";
    }
    window.updateCartUI();
  });
}

// Recherche & Filtres
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');

if (searchInput) {
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') e.preventDefault();
  });

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    renderProducts(products.filter(p => p.name.toLowerCase().includes(term)));
  });
}

if (sortSelect) {
  sortSelect.addEventListener('change', (e) => {
    let sorted = [...products];
    if (e.target.value === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    if (e.target.value === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    renderProducts(sorted);
  });
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    const category = e.target.dataset.category;
    renderProducts(category === 'all' ? products : products.filter(p => p.category === category));
  });
});

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
  renderProducts(products);
  window.updateCartUI();
});

// Envoi de la commande par Formspree
async function sendOrderEmail() {
  if (window.cart.length === 0) {
    alert("Ton panier est vide !");
    return;
  }

  const nom = prompt("Ton Nom :");
  if (!nom) return;

  const prenom = prompt("Ton Prénom :");
  if (!prenom) return;

  const email = prompt("Ton adresse E-mail :");
  if (!email) return;

  const telephone = prompt("Ton numéro de Téléphone :");
  if (!telephone) return;

  const adresse = prompt("Ton Adresse postale :");
  if (!adresse) return;

  const ville = prompt("Ta Ville et Code Postal :");
  if (!ville) return;

  let orderDetails = window.cart.map(item => 
    `- ${item.name} | Taille: ${item.selectedSize} ${item.selectedColor ? '| Coloris: ' + item.selectedColor : ''} | Qte: ${item.quantity} | Prix: ${(item.price * item.quantity).toFixed(2)}€`
  ).join('\n');

  let total = window.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * (1 - appliedDiscount);

  const messageBody = `
NOUVELLE COMMANDE RAWZ

--- INFORMATIONS CLIENT ---
Nom : ${nom}
Prénom : ${prenom}
E-mail : ${email}
Téléphone : ${telephone}
Adresse : ${adresse}
Ville : ${ville}

--- DÉTAIL DU PANIER ---
${orderDetails}

TOTAL : ${total.toFixed(2)} €
  `;

  const data = {
    email: email,
    message: messageBody
  };

  try {
    const response = await fetch("https://formspree.io/f/xjybbzln", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      alert("Commande envoyée avec succès ! Tu recevras un récapitulatif rapidement.");
      window.cart = [];
      window.saveCart();
      window.updateCartUI();
      closeCart();
    } else {
      alert("Erreur lors de l'envoi de la commande. Réessaie plus tard.");
    }
  } catch (error) {
    alert("Erreur réseau : impossible d'envoyer la commande.");
  }
}
