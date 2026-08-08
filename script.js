// Base de données : 4 articles complets
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
      "Noir/Blanc": ["images/polo-noir-r-blanches.jpg", "images/polo-noir-r-blanches-back.jpg"],
      "Noir/Rose": ["images/polo-noir-r-roses.jpg", "images/polo-noir-r-roses-back.jpg"],
      "Blanc/Rouge": ["images/polo-blanc-r-rouges.jpg", "images/polo-blanc-r-rouges-back.jpg"],
      "Rouge/Blanc": ["images/polo-rouge-r-blanches.jpg", "images/polo-rouge-r-blanches-back.jpg"]
    }
  },
  { 
    id: 3, 
    name: "Polo Baggy Court", 
    category: "polo", 
    price: 17.99, 
    sizes: ["S", "M", "L", "XL"],
    colors: ["Noir"],
    description: "Style : Streetwear | Matière : 100 % Coton | Col : Col rabattu",
    mainImage: "images/polo-signature.jpg",
    images: [
      "images/polo-signature.jpg",
      "images/polo-signature-zoom.jpg"
    ]
  },
  { 
    id: 4, 
    name: "T-Shirt Tricoté", 
    category: "t-shirt", 
    price: 18.99, 
    sizes: ["S", "M", "L", "XL"],
    colors: ["Militaire"],
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

const menuDrawer = document.getElementById('menu-drawer');
const menuOverlay = document.getElementById('menu-overlay');

// Fonctions Menu Burger
function openMenu() {
  if (menuDrawer && menuOverlay) {
    menuDrawer.classList.add('open');
    menuOverlay.classList.add('active');
  }
}

function closeMenu() {
  if (menuDrawer && menuOverlay) {
    menuDrawer.classList.remove('open');
    menuOverlay.classList.remove('active');
  }
}

// Mode sombre
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    document.documentElement.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
  });
}

// Rendu du catalogue sur index.html
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

// Fonction centrale de filtrage
function filterByCategory(category) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.dataset.category === category) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (category === 'all') {
    renderProducts(products);
  } else {
    const filtered = products.filter(p => p.category === category);
    renderProducts(filtered);
  }
}

// Logique du Panier
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

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
          <button onclick="changeQuantity('${item.key}', -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="changeQuantity('${item.key}', 1)">+</button>
        </div>
      </div>
      <button onclick="removeFromCart('${item.key}')" class="delete-btn">✕</button>
    `;
    cartItemsContainer.appendChild(itemEl);
  });

  let finalTotal = subtotal * (1 - appliedDiscount);
  if (cartBadge) cartBadge.textContent = count;
  if (cartTotalPrice) cartTotalPrice.textContent = `${finalTotal.toFixed(2)} €`;
}

function changeQuantity(cartItemKey, delta) {
  const item = cart.find(i => i.key === cartItemKey);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) cart = cart.filter(i => i.key !== cartItemKey);

  saveCart();
  updateCartUI();
}

function removeFromCart(cartItemKey) {
  cart = cart.filter(item => item.key !== cartItemKey);
  saveCart();
  updateCartUI();
}

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

// Appliquer le Code Promo
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

// Modale Checkout
function openCheckoutModal() {
  if (cart.length === 0) {
    alert("Ton panier est vide !");
    return;
  }
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.add('active');
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.remove('active');
}

// INTÉGRATION BOUTONS PAYPAL
function initPayPalButton() {
  const paypalContainer = document.getElementById('paypal-button-container');
  if (!paypalContainer || typeof paypal === 'undefined') return;

  paypalContainer.innerHTML = '';

  paypal.Buttons({
    style: {
      layout: 'vertical',
      color:  'gold',
      shape:  'rect',
      label:  'paypal'
    },
    onInit: function(data, actions) {
      actions.disable(); // Désactivé par défaut jusqu'à ce que les champs soient remplis

      const form = document.getElementById('checkout-form');
      if (form) {
        form.addEventListener('input', () => {
          if (form.checkValidity()) {
            actions.enable();
          } else {
            actions.disable();
          }
        });
      }
    },
    onClick: function() {
      const form = document.getElementById('checkout-form');
      if (form && !form.checkValidity()) {
        alert("Merci de remplir tous les champs de livraison obligatoires avant de procéder au paiement.");
      }
    },
    createOrder: function(data, actions) {
      let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      let total = (subtotal * (1 - appliedDiscount)).toFixed(2);

      return actions.order.create({
        purchase_units: [{
          amount: {
            value: total,
            currency_code: 'EUR'
          }
        }]
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(async function(details) {
        // Envoi des infos à Formspree après le paiement réussi
        const firstname = document.getElementById('client-firstname').value.trim();
        const lastname = document.getElementById('client-lastname').value.trim();
        const email = document.getElementById('client-email').value.trim();
        const phone = document.getElementById('client-phone').value.trim();
        const address = document.getElementById('client-address').value.trim();
        const zipcode = document.getElementById('client-zipcode').value.trim();
        const city = document.getElementById('client-city').value.trim();

        let orderDetails = cart.map(item => 
          `- ${item.name} | Taille: ${item.selectedSize} ${item.selectedColor ? '| Coloris: ' + item.selectedColor : ''} | Qte: ${item.quantity} | Prix: ${(item.price * item.quantity).toFixed(2)}€`
        ).join('\n');

        let total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * (1 - appliedDiscount);

        const formData = {
          Nom: lastname,
          Prénom: firstname,
          Email: email,
          Téléphone: phone,
          Adresse: address,
          Code_postal: zipcode,
          Ville: city,
          Message: `COMMANDE PAYÉE ET VALIDÉE PAR PAYPAL (${details.id}) :\n\nINFORMATIONS CLIENT :\nNom : ${lastname}\nPrénom : ${firstname}\nEmail : ${email}\nTéléphone : ${phone}\nAdresse : ${address}, ${zipcode} ${city}\n\nDÉTAIL DU PANIER :\n${orderDetails}\n\nTOTAL PAYÉ : ${total.toFixed(2)} €`
        };

        try {
          await fetch("https://formspree.io/f/xgaweybe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify(formData)
          });
        } catch (e) {
          console.error("Erreur de sauvegarde Formspree", e);
        }

        alert("Paiement réussi ! Merci " + details.payer.name.given_name + ", ta commande est bien validée.");
        cart = [];
        saveCart();
        updateCartUI();
        closeCheckoutModal();
        closeCart();
        document.getElementById('checkout-form').reset();
      });
    },
    onError: function(err) {
      console.error(err);
      alert("Une erreur est survenue lors du paiement PayPal.");
    }
  }).render('#paypal-button-container');
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
  renderProducts(products);
  updateCartUI();
  initPayPalButton();

  const burgerToggle = document.getElementById('burger-toggle');
  const closeMenuBtn = document.getElementById('close-menu');

  if (burgerToggle) burgerToggle.addEventListener('click', openMenu);
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
  if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const category = e.target.dataset.category;
      filterByCategory(category);
    });
  });

  document.querySelectorAll('.menu-filter-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const selectedCategory = link.getAttribute('data-category');
      filterByCategory(selectedCategory);
      closeMenu();
    });
  });

  const closeModalBtn = document.getElementById('close-modal-btn');
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeCheckoutModal);
});
