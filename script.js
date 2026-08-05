// --- BASE DE DONNÉES PRODUITS ---
const products = [
  {
    id: "1",
    name: "T-Shirt RAWZ Oversize",
    price: 35.00,
    category: "tshirts",
    description: "T-shirt coupe oversize en coton lourd 240 GSM. Sérigraphie haute qualité.",
    colors: ["Noir/Blanc", "Blanc/Noir"],
    sizes: ["S", "M", "L", "XL"],
    images: ["images/tshirt1.jpg", "images/tshirt1-back.jpg"]
  },
  {
    id: "2",
    name: "Polo RAWZ Classic",
    price: 45.00,
    category: "polo",
    description: "Polo structuré coupe moderne avec broderie discrète.",
    colors: ["Noir", "Gris"],
    sizes: ["S", "M", "L", "XL"],
    images: ["images/polo1.jpg"]
  },
  {
    id: "3",
    name: "Chemise RAWZ Street",
    price: 55.00,
    category: "chemise",
    description: "Chemise fluide coupe ample idéale pour la saison.",
    colors: ["Noir"],
    sizes: ["M", "L", "XL"],
    images: ["images/chemise1.jpg"]
  }
];

// --- VARIABLES GLOBALES ---
let cart = JSON.parse(localStorage.getItem('rawz_cart')) || [];
let appliedDiscount = 0;

// --- GESTION DU PANIER ---
function saveCart() {
  localStorage.setItem('rawz_cart', JSON.stringify(cart));
}

function updateCartUI() {
  const cartBadge = document.getElementById('cart-badge');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalPrice = document.getElementById('cart-total-price');

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartBadge) cartBadge.textContent = totalCount;

  if (!cartItemsContainer) return;

  let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let total = subtotal * (1 - appliedDiscount);

  if (cartTotalPrice) cartTotalPrice.textContent = `${total.toFixed(2)} €`;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `<p class="empty-cart-msg">Ton panier est vide.</p>`;
    return;
  }

  cartItemsContainer.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p class="cart-item-specs">
          ${item.selectedSize ? 'Taille: ' + item.selectedSize : ''} 
          ${item.selectedColor ? '| Coloris: ' + item.selectedColor : ''}
        </p>
        <p class="cart-item-price">${(item.price * item.quantity).toFixed(2)} €</p>
        <div class="cart-item-qty">
          <button onclick="changeQty(${index}, -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="changeQty(${index}, 1)">+</button>
        </div>
      </div>
      <button onclick="removeFromCart(${index})" class="remove-item-btn">&times;</button>
    </div>
  `).join('');
}

function changeQty(index, change) {
  if (cart[index]) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    saveCart();
    updateCartUI();
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartUI();
}

// GESTION PANIER DRAWER
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartToggleBtn = document.getElementById('cart-toggle-btn');
const closeCartBtn = document.getElementById('close-cart-btn');

function openCart() {
  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
  }
}

function closeCart() {
  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
  }
}

if (cartToggleBtn) cartToggleBtn.onclick = openCart;
if (closeCartBtn) closeCartBtn.onclick = closeCart;
if (cartOverlay) cartOverlay.onclick = closeCart;

// GESTION DE LA MODALE & COMMANDE
function openCheckoutModal() {
  if (cart.length === 0) {
    alert("Ton panier est vide !");
    return;
  }
  
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.add('active');
    setupModalEvents();
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function setupModalEvents() {
  const closeModalBtn = document.getElementById('close-modal-btn');
  const checkoutForm = document.getElementById('checkout-form');
  
  if (closeModalBtn) {
    closeModalBtn.onclick = closeCheckoutModal;
  }

  if (checkoutForm) {
    checkoutForm.onsubmit = async (e) => {
      e.preventDefault();

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

      const data = {
        nom: lastname,
        prenom: firstname,
        email: email,
        telephone: phone,
        adresse: address,
        code_postal: zipcode,
        ville: city,
        message: `NOUVELLE COMMANDE RAWZ :\n\nINFORMATIONS CLIENT :\nNom : ${lastname}\nPrénom : ${firstname}\nEmail : ${email}\nTéléphone : ${phone}\nAdresse : ${address}, ${zipcode} ${city}\n\nDÉTAIL DU PANIER :\n${orderDetails}\n\nTOTAL FINAL : ${total.toFixed(2)} €`
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
          alert("Commande envoyée avec succès !");
          cart = [];
          saveCart();
          updateCartUI();
          closeCheckoutModal();
          closeCart();
          checkoutForm.reset();
        } else {
          alert("Erreur lors de l'envoi de la commande.");
        }
      } catch (error) {
        alert("Erreur réseau : impossible d'envoyer la commande.");
      }
    };
  }
}

// RENDU CATALOGUE INDEX.HTML
function renderProducts(productList) {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  grid.innerHTML = productList.map(product => `
    <div class="product-card">
      <a href="product.html?id=${product.id}">
        <img src="${product.images[0]}" alt="${product.name}" class="product-img">
      </a>
      <div class="product-card-body">
        <h3>${product.name}</h3>
        <p class="product-card-price">${product.price.toFixed(2)} €</p>
        <a href="product.html?id=${product.id}" class="view-btn">Voir le produit</a>
      </div>
    </div>
  `).join('');
}

// INITIALISATION
document.addEventListener('DOMContentLoaded', () => {
  renderProducts(products);
  updateCartUI();
});
