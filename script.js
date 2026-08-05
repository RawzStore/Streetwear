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
    description: "Col en polyester élastique avec motif à rayures color-block et imprimé typographique (lettres et chiffres). Lavable en machine.",
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

let cart = JSON.parse(localStorage.getItem('cart')) || [];
let appliedDiscount = 0;

// Éléments DOM généraux
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

// Sauvegarde du panier
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Mise à jour du panier
function updateCartUI() {
  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = '';
  let subtotal = 0;
  let count = 0;

  cart.forEach(item => {
    subtotal += item.price * item.quantity;
    count += item.quantity;

    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <small>Taille: ${item.selectedSize} ${item.selectedColor ? '| Coloris: ' + item.selectedColor : ''}</small>
        <small>${item.price.toFixed(2)} €</small>
        <div class="qty-controls">
          <button type="button" class="btn-qty btn-minus" data-key="${item.key}">-</button>
          <span>${item.quantity}</span>
          <button type="button" class="btn-qty btn-plus" data-key="${item.key}">+</button>
        </div>
      </div>
      <button type="button" class="delete-btn" data-key="${item.key}">✕</button>
    `;
    cartItemsContainer.appendChild(itemEl);
  });

  // Écouteurs d'événements pour les boutons de quantité et de suppression (solution optimale mobile/desktop)
  document.querySelectorAll('.btn-minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      changeQuantity(btn.dataset.key, -1);
    });
  });

  document.querySelectorAll('.btn-plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      changeQuantity(btn.dataset.key, 1);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeFromCart(btn.dataset.key);
    });
  });

  let finalTotal = subtotal * (1 - appliedDiscount);
  if (cartBadge) cartBadge.textContent = count;
  if (cartTotalPrice) cartTotalPrice.textContent = `${finalTotal.toFixed(2)} €`;
}

// Fonctions de modification
function changeQuantity(cartItemKey, delta) {
  const item = cart.find(i => i.key === cartItemKey);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.key !== cartItemKey);
  }

  saveCart();
  updateCartUI();
}

function removeFromCart(cartItemKey) {
  cart = cart.filter(item => item.key !== cartItemKey);
  saveCart();
  updateCartUI();
}

// Rendre accessible globalement au besoin
window.changeQuantity = changeQuantity;
window.removeFromCart = removeFromCart;

// Ouverture & fermeture Panier
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
    updateCartUI();
  });
}

// Filtres et Recherche
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
  updateCartUI();
  injectCheckoutModal();
});

// Injection dynamique du formulaire de commande adapté au mobile
function injectCheckoutModal() {
  if (document.getElementById('checkout-modal')) return;

  const modalHTML = `
    <div id="checkout-modal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Informations de livraison</h3>
          <button type="button" id="close-modal-btn" class="close-btn">&times;</button>
        </div>
        <form id="checkout-form">
          <div class="form-group">
            <input type="text" id="cust-nom" placeholder="Nom" required>
          </div>
          <div class="form-group">
            <input type="text" id="cust-prenom" placeholder="Prénom" required>
          </div>
          <div class="form-group">
            <input type="email" id="cust-email" placeholder="Adresse e-mail" required>
          </div>
          <div class="form-group">
            <input type="tel" id="cust-tel" placeholder="Téléphone" required>
          </div>
          <div class="form-group">
            <input type="text" id="cust-adresse" placeholder="Adresse postale" required>
          </div>
          <div class="form-group">
            <input type="text" id="cust-ville" placeholder="Ville et Code Postal" required>
          </div>
          <button type="submit" class="submit-order-btn">Confirmer la commande</button>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.getElementById('checkout-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const checkoutForm = document.getElementById('checkout-form');

  closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));

  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await processOrder();
  });
}

// Déclenchement de la commande
function sendOrderEmail() {
  if (cart.length === 0) {
    alert("Ton panier est vide !");
    return;
  }
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.add('active');
}
window.sendOrderEmail = sendOrderEmail;

// Traitement et envoi de la commande à Formspree
async function processOrder() {
  const nom = document.getElementById('cust-nom').value.trim();
  const prenom = document.getElementById('cust-prenom').value.trim();
  const email = document.getElementById('cust-email').value.trim();
  const telephone = document.getElementById('cust-tel').value.trim();
  const adresse = document.getElementById('cust-adresse').value.trim();
  const ville = document.getElementById('cust-ville').value.trim();

  let orderDetails = cart.map(item => 
    `- ${item.name} | Taille: ${item.selectedSize} ${item.selectedColor ? '| Coloris: ' + item.selectedColor : ''} | Qte: ${item.quantity} | Prix: ${(item.price * item.quantity).toFixed(2)}€`
  ).join('\n');

  let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * (1 - appliedDiscount);

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

  const submitBtn = document.querySelector('.submit-order-btn');
  if (submitBtn) submitBtn.textContent = "Envoi en cours...";

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
      cart = [];
      saveCart();
      updateCartUI();
      closeCart();
      document.getElementById('checkout-modal').classList.remove('active');
      document.getElementById('checkout-form').reset();
    } else {
      alert("Erreur lors de l'envoi de la commande. Réessaie plus tard.");
    }
  } catch (error) {
    alert("Erreur réseau : impossible d'envoyer la commande.");
  } finally {
    if (submitBtn) submitBtn.textContent = "Confirmer la commande";
  }
}
