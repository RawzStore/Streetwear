// ==========================================
// 1. BASE DE DONNÉES PRODUITS
// ==========================================
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
    price: 24.99, 
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

// Variables d'état
let cart = JSON.parse(localStorage.getItem('rawz_cart')) || [];
let appliedDiscount = 0;
let currentCategory = 'all';
let currentSearchTerm = '';

// ==========================================
// 2. MENU BURGER
// ==========================================
function openMenu() {
  const menuDrawer = document.getElementById('menu-drawer');
  const menuOverlay = document.getElementById('menu-overlay');
  if (menuDrawer && menuOverlay) {
    menuDrawer.classList.add('open');
    menuOverlay.classList.add('active');
  }
}

function closeMenu() {
  const menuDrawer = document.getElementById('menu-drawer');
  const menuOverlay = document.getElementById('menu-overlay');
  if (menuDrawer && menuOverlay) {
    menuDrawer.classList.remove('open');
    menuOverlay.classList.remove('active');
  }
}

// ==========================================
// 3. CATALOGUE & FILTRES
// ==========================================
function renderProducts(items) {
  const productGrid = document.getElementById('product-grid');
  if (!productGrid) return;
  
  productGrid.innerHTML = '';
  if (items.length === 0) {
    productGrid.innerHTML = '<p class="no-products">Aucun produit trouvé.</p>';
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

function applyFiltersAndRender() {
  let filtered = [...products];

  if (currentCategory !== 'all') {
    filtered = filtered.filter(p => p.category === currentCategory);
  }

  if (currentSearchTerm.trim() !== '') {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(currentSearchTerm.toLowerCase()));
  }

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect && sortSelect.value) {
    if (sortSelect.value === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    if (sortSelect.value === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  }

  renderProducts(filtered);
}

function filterByCategory(category) {
  currentCategory = category;

  document.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.dataset.category === category) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  applyFiltersAndRender();
}

// ==========================================
// 4. PANIER (LOCALSTORAGE & UI)
// ==========================================
function saveCart() {
  localStorage.setItem('rawz_cart', JSON.stringify(cart));
}

function updateCartUI() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartBadge = document.getElementById('cart-badge');
  const cartTotalPrice = document.getElementById('cart-total-price');

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
      <img src="${item.image || 'images/default.jpg'}" alt="${item.name}" class="cart-item-img">
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
  if (cartTotalPrice) cartTotalPrice.textContent = `${finalTotal.toFixed(2).replace('.', ',')} €`;

  const checkoutBtn = document.getElementById('checkout-btn') || document.getElementById('open-checkout-btn');
  if (checkoutBtn) {
    const isEmpty = cart.length === 0;
    checkoutBtn.disabled = isEmpty;
    checkoutBtn.style.opacity = isEmpty ? '0.5' : '1';
    checkoutBtn.style.cursor = isEmpty ? 'not-allowed' : 'pointer';
  }

  updateCheckoutSummary();
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

function openCart() {
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('active');
  }
}

function closeCart() {
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('active');
  }
}

// ==========================================
// 5. MODALE CHECKOUT & CALCULS
// ==========================================
function openCheckoutModal() {
  if (cart.length === 0) {
    alert("Ton panier est vide !");
    return;
  }
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.add('active');
    updateCheckoutSummary();
    toggleMondialRelayZone();
    checkZipcodeState();
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.remove('active');
}

function updateCheckoutSummary() {
  let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let discountedSubtotal = subtotal * (1 - appliedDiscount);

  const selectedMode = document.querySelector('input[name="mode_de_livraison"]:checked')?.value || 'Mondial Relay';
  let shippingCost = 0.00;

  if (selectedMode === 'Mondial Relay') {
    shippingCost = 3.90;
  } else if (selectedMode.includes('Colissimo')) {
    shippingCost = 9.50;
  } else if (selectedMode.includes('Remise en main propre')) {
    shippingCost = 0.00;
  }

  if (discountedSubtotal >= 80 && !selectedMode.includes('Remise en main propre')) {
    shippingCost = 0.00;
  }

  const finalTotal = discountedSubtotal + shippingCost;

  const subtotalEl = document.getElementById('summary-subtotal');
  const shippingEl = document.getElementById('summary-shipping');
  const totalEl = document.getElementById('summary-total');

  if (subtotalEl) subtotalEl.textContent = `${discountedSubtotal.toFixed(2).replace('.', ',')} €`;
  if (shippingEl) {
    if (shippingCost === 0 && !selectedMode.includes('Remise en main propre')) {
      shippingEl.textContent = 'Offerte (dès 80€)';
    } else if (shippingCost === 0 && selectedMode.includes('Remise en main propre')) {
      shippingEl.textContent = 'Gratuit';
    } else {
      shippingEl.textContent = `${shippingCost.toFixed(2).replace('.', ',')} €`;
    }
  }
  if (totalEl) totalEl.textContent = `${finalTotal.toFixed(2).replace('.', ',')} €`;

  return {
    subtotal: discountedSubtotal,
    shippingCost: shippingCost,
    total: finalTotal
  };
}

// ==========================================
// 6. MONDIAL RELAY
// ==========================================
function checkZipcodeState() {
  const zipInput = document.getElementById('client-zipcode');
  const openMrBtn = document.getElementById('open-mr-widget-btn');
  if (!zipInput || !openMrBtn) return;

  if (zipInput.value.trim().length === 5) {
    openMrBtn.disabled = false;
    openMrBtn.style.opacity = '1';
    openMrBtn.style.cursor = 'pointer';
  } else {
    openMrBtn.disabled = true;
    openMrBtn.style.opacity = '0.5';
    openMrBtn.style.cursor = 'not-allowed';
  }
}

function initMondialRelayWidget() {
  const zipcodeEl = document.getElementById('client-zipcode');
  const zipcode = zipcodeEl ? zipcodeEl.value.trim() : '';

  if (!zipcode || zipcode.length < 5) {
    alert("Entre un code postal valide (5 chiffres) avant de choisir un Point Relais.");
    if (zipcodeEl) zipcodeEl.focus();
    return;
  }

  if (typeof $ === 'undefined') {
    alert("jQuery n'est pas chargé sur la page.");
    return;
  }

  const handleSelected = function(data) {
    const relayDetails = `${data.Nom} (${data.ID}) - ${data.Adresse1}, ${data.CP} ${data.Ville}`;

    const relayIdEl = document.getElementById('mr-relay-id');
    const relayNameEl = document.getElementById('mr-relay-name');
    const relayAddressEl = document.getElementById('mr-relay-address');

    if (relayIdEl) relayIdEl.value = data.ID;
    if (relayNameEl) relayNameEl.value = data.Nom;
    if (relayAddressEl) relayAddressEl.value = `${data.Adresse1}, ${data.CP} ${data.Ville}`;

    const infoDiv = document.getElementById('mr-selected-info');
    const detailsSpan = document.getElementById('mr-relay-details');
    if (infoDiv && detailsSpan) {
      detailsSpan.textContent = relayDetails;
      infoDiv.style.display = 'block';
    }
  };

  if ($.fn.MR_ParcelShopPicker) {
    $("#Zone_Widget").MR_ParcelShopPicker({
      Target: "#mr-relay-id",
      TargetDisplay: "#mr-relay-name",
      TargetDisplayInfoPR: "#mr-relay-address",
      Brand: "BDTEST  ",
      Country: "FR",
      PostCode: zipcode,
      ColLivMod: "24R",
      AllowedCountries: "FR",
      OnParcelShopSelected: handleSelected
    });
  } else if ($.mr_widget) {
    $("#Zone_Widget").mr_widget({
      Target: "#Zone_Widget",
      Brand: "BDTEST  ",
      Country: "FR",
      PostCode: zipcode,
      ColMode: "REL",
      AllowedDeliveryMode: "24R",
      DefaultCountry: "FR",
      Weight: "1000",
      NbResults: "5",
      OnParcelShopSelected: handleSelected
    });
  } else {
    alert("Le script Mondial Relay ne s'est pas chargé correctement.");
  }
}

function toggleMondialRelayZone() {
  const selectedMode = document.querySelector('input[name="mode_de_livraison"]:checked')?.value;
  const mrZone = document.getElementById('zone-mondial-relay');

  if (mrZone) {
    mrZone.style.display = (selectedMode === 'Mondial Relay') ? 'block' : 'none';
  }
}

// ==========================================
// 7. ENVOI FORMSPREE & REDIRECTION STRIPE (CB)
// ==========================================
async function processOrderSubmit() {
  const firstname = document.getElementById('client-firstname')?.value.trim() || '';
  const lastname = document.getElementById('client-lastname')?.value.trim() || '';
  const email = document.getElementById('client-email')?.value.trim() || '';
  const phone = document.getElementById('client-phone')?.value.trim() || '';
  const address = document.getElementById('client-address')?.value.trim() || '';
  const zipcode = document.getElementById('client-zipcode')?.value.trim() || '';
  const city = document.getElementById('client-city')?.value.trim() || '';
  const deliveryMode = document.querySelector('input[name="mode_de_livraison"]:checked')?.value || 'Mondial Relay';

  const relayId = document.getElementById('mr-relay-id')?.value || '';
  const relayName = document.getElementById('mr-relay-name')?.value || '';
  const relayAddress = document.getElementById('mr-relay-address')?.value || '';

  const summary = updateCheckoutSummary();

  let orderDetails = cart.map(item => 
    `- ${item.name} | Taille: ${item.selectedSize} ${item.selectedColor ? '| Coloris: ' + item.selectedColor : ''} | Qte: ${item.quantity} | Prix: ${(item.price * item.quantity).toFixed(2)}€`
  ).join('\n');

  const formData = {
    "1_Client": `${firstname} ${lastname}`,
    "2_Email": email,
    "3_Telephone": phone,
    "4_Adresse_Livraison": `${address}, ${zipcode} ${city}`,
    "5_Mode_de_Livraison": deliveryMode,
    "6_Point_Relais": (deliveryMode === 'Mondial Relay' && relayId) ? `${relayName} (${relayId}) - ${relayAddress}` : 'Non applicable',
    "7_Articles_Commandes": orderDetails,
    "8_Total_Articles": `${summary.subtotal.toFixed(2)} €`,
    "9_Frais_Livraison": `${summary.shippingCost.toFixed(2)} €`,
    "10_TOTAL_ESTIME": `${summary.total.toFixed(2)} €`
  };

  const submitBtn = document.getElementById('sumup-submit-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Traitement de la commande...';
  }

  try {
    // 1. Envoi à Formspree pour enregistrer les infos du client
    await fetch("https://formspree.io/f/xgaweybe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(formData)
    }).catch(err => console.error("Erreur Formspree :", err));

    // 2. Création de la session de paiement Stripe sur Vercel
    const checkoutResponse = await fetch("https://rawz-store.vercel.app/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cart: cart,
        deliveryMode: deliveryMode,
        promoCode: (appliedDiscount > 0) ? "RAWZ10" : "",
        email: email
      })
    });

    const checkoutData = await checkoutResponse.json();

    if (checkoutData.url) {
      // Nettoyage du panier
      cart = [];
      saveCart();
      updateCartUI();

      // Redirection vers la page sécurisée de paiement CB Stripe
      window.location.href = checkoutData.url;
    } else {
      alert("Erreur lors de la préparation du paiement. Vérifie tes informations.");
    }
  } catch (e) {
    console.error("Erreur lors de la commande :", e);
    alert("Erreur de connexion avec le serveur de paiement.");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-regular fa-credit-card"></i> Payer par Carte Bancaire';
    }
  }
}

// ==========================================
// 8. PAGE PRODUIT (INTERACTION VIGNETTES ET COULEURS)
// ==========================================
function initProductPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id'), 10);
  if (isNaN(productId)) return;

  const product = products.find(p => p.id === productId);
  if (!product) return;

  const titleEl = document.getElementById('product-title') || document.getElementById('product-name');
  const priceEl = document.getElementById('product-price');
  const descEl = document.getElementById('product-description');
  const mainImgEl = document.getElementById('display-img') || document.getElementById('main-product-img');
  const thumbsContainer = document.getElementById('thumbnails-container');
  const colorSwatchesContainer = document.getElementById('color-swatches-container');
  const selectedColorName = document.getElementById('selected-color-name');
  const sizeSelect = document.getElementById('size-select');
  const addToCartBtn = document.getElementById('add-to-cart-btn');

  let activeColor = (product.colors && product.colors.length > 0) ? product.colors[0] : '';

  if (titleEl) titleEl.textContent = product.name;
  if (priceEl) priceEl.textContent = `${product.price.toFixed(2)} €`;
  if (descEl) descEl.textContent = product.description;

  const getImagesForColor = (color) => {
    if (product.imagesByColor && product.imagesByColor[color] && product.imagesByColor[color].length > 0) {
      return product.imagesByColor[color];
    }
    if (product.images && product.images.length > 0) {
      return product.images;
    }
    return [product.mainImage];
  };

  const updateGallery = (imageList) => {
    if (!thumbsContainer || !mainImgEl || !imageList || imageList.length === 0) return;
    
    thumbsContainer.innerHTML = '';
    mainImgEl.src = imageList[0];

    imageList.forEach((imgSrc, index) => {
      const thumb = document.createElement('img');
      thumb.src = imgSrc;
      thumb.alt = `${product.name} - ${index + 1}`;
      thumb.className = `thumbnail ${index === 0 ? 'active' : ''}`;
      
      thumb.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        mainImgEl.src = imgSrc;

        const currentThumbs = thumbsContainer.querySelectorAll('.thumbnail');
        currentThumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });

      thumbsContainer.appendChild(thumb);
    });
  };

  if (colorSwatchesContainer && product.colors && product.colors.length > 0) {
    colorSwatchesContainer.innerHTML = '';
    if (selectedColorName) selectedColorName.textContent = activeColor;

    product.colors.forEach((color, index) => {
      const colorImages = getImagesForColor(color);
      const swatch = document.createElement('img');
      swatch.src = colorImages[0] || product.mainImage;
      swatch.alt = color;
      swatch.title = color;
      swatch.className = `color-swatch ${index === 0 ? 'active' : ''}`;

      swatch.addEventListener('click', () => {
        activeColor = color;
        if (selectedColorName) selectedColorName.textContent = color;

        colorSwatchesContainer.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');

        updateGallery(getImagesForColor(color));
      });

      colorSwatchesContainer.appendChild(swatch);
    });
  }

  updateGallery(getImagesForColor(activeColor));

  if (sizeSelect && product.sizes) {
    sizeSelect.innerHTML = product.sizes.map(s => `<option value="${s}">${s}</option>`).join('');
  }

  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const selectedSize = sizeSelect ? sizeSelect.value : (product.sizes ? product.sizes[0] : '');
      const cartKey = `${product.id}-${selectedSize}-${activeColor || 'default'}`;

      const currentImages = getImagesForColor(activeColor);
      const itemImage = currentImages[0] || product.mainImage;

      const existingItem = cart.find(i => i.key === cartKey);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          key: cartKey,
          id: product.id,
          name: product.name,
          price: product.price,
          selectedSize: selectedSize,
          selectedColor: activeColor,
          image: itemImage,
          quantity: 1
        });
      }

      saveCart();
      updateCartUI();

      const toast = document.getElementById('toast-notification');
      if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
      }
    });
  }

  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = item.querySelector('.accordion-content');
      const toggleSign = header.querySelector('span:last-child');

      const isOpen = item.classList.contains('active');

      if (isOpen) {
        item.classList.remove('active');
        if (content) content.style.maxHeight = null;
        if (toggleSign) toggleSign.textContent = '+';
      } else {
        item.classList.add('active');
        if (content) content.style.maxHeight = `${content.scrollHeight}px`;
        if (toggleSign) toggleSign.textContent = '−';
      }
    });
  });
}

// ==========================================
// 9. INITIALISATION GLOBALE DU DOM
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  renderProducts(products);
  updateCartUI();
  initProductPage();
  toggleMondialRelayZone();

  // EMPECHER TOTALEMENT LE RECHARGEMENT DU FORMULAIRE
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      return false;
    });
  }

  // GESTION DU BOUTON DE PAIEMENT
  const sumupSubmitBtn = document.getElementById('sumup-submit-btn');
  if (sumupSubmitBtn) {
    sumupSubmitBtn.addEventListener('click', (e) => {
      e.preventDefault();

      // Validation HTML5 des champs obligatoires
      if (checkoutForm && !checkoutForm.checkValidity()) {
        checkoutForm.reportValidity();
        return;
      }

      // Validation de la sélection du point relais si Mondial Relay est choisi
      const selectedMode = document.querySelector('input[name="mode_de_livraison"]:checked')?.value;
      if (selectedMode === 'Mondial Relay') {
        const relayId = document.getElementById('mr-relay-id')?.value;
        if (!relayId) {
          alert("Merci de sélectionner un Point Relais avant de valider la commande.");
          return;
        }
      }

      // Lancement de la procédure d'envoi
      processOrderSubmit();
    });
  }

  document.querySelectorAll('input[name="mode_de_livraison"]').forEach(radio => {
    radio.addEventListener('change', () => {
      updateCheckoutSummary();
      toggleMondialRelayZone();
    });
  });

  const zipInput = document.getElementById('client-zipcode');
  if (zipInput) {
    zipInput.addEventListener('input', checkZipcodeState);
    checkZipcodeState();
  }

  const openMrBtn = document.getElementById('open-mr-widget-btn');
  if (openMrBtn) {
    openMrBtn.addEventListener('click', (e) => {
      e.preventDefault();
      initMondialRelayWidget();
    });
  }

  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      document.documentElement.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');
      themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
    });
  }

  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartOverlay = document.getElementById('cart-overlay');
  const checkoutBtn = document.getElementById('checkout-btn') || document.getElementById('open-checkout-btn');

  if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
  if (checkoutBtn) checkoutBtn.addEventListener('click', openCheckoutModal);

  const applyPromoBtn = document.getElementById('apply-promo-btn');
  const promoInput = document.getElementById('promo-input');
  const promoMsg = document.getElementById('promo-msg');

  if (applyPromoBtn && promoInput && promoMsg) {
    applyPromoBtn.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (code === "RAWZ10") {
        appliedDiscount = 0.10;
        promoMsg.textContent = "Code RAWZ10 appliqué (-10%) !";
        promoMsg.className = "promo-message success";
      } else if (code === "") {
        appliedDiscount = 0;
        promoMsg.textContent = "";
        promoMsg.className = "promo-message";
      } else {
        appliedDiscount = 0;
        promoMsg.textContent = "Code invalide.";
        promoMsg.className = "promo-message error";
      }
      updateCartUI();
    });
  }

  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchTerm = e.target.value;
      applyFiltersAndRender();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      applyFiltersAndRender();
    });
  }

  const burgerToggle = document.getElementById('burger-toggle');
  const closeMenuBtn = document.getElementById('close-menu');
  const menuOverlay = document.getElementById('menu-overlay');

  if (burgerToggle) burgerToggle.addEventListener('click', openMenu);
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
  if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterByCategory(e.currentTarget.dataset.category);
    });
  });

  document.querySelectorAll('.menu-filter-link').forEach(link => {
    link.addEventListener('click', (e) => {
      filterByCategory(link.getAttribute('data-category'));
      closeMenu();
    });
  });

  const closeModalBtn = document.getElementById('close-modal-btn');
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeCheckoutModal);

  const mentionsModal = document.getElementById('mentions-modal');
  const returnsModal = document.getElementById('returns-modal');

  const openMentionsBtn = document.getElementById('open-mentions-btn');
  const openReturnsBtn = document.getElementById('open-returns-btn');

  const closeMentionsBtn = document.getElementById('close-mentions-btn');
  const closeReturnsBtn = document.getElementById('close-returns-btn');

  if (openMentionsBtn && mentionsModal) {
    openMentionsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      mentionsModal.classList.add('active');
    });
  }

  if (openReturnsBtn && returnsModal) {
    openReturnsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      returnsModal.classList.add('active');
    });
  }

  if (closeMentionsBtn && mentionsModal) {
    closeMentionsBtn.addEventListener('click', () => mentionsModal.classList.remove('active'));
  }

  if (closeReturnsBtn && returnsModal) {
    closeReturnsBtn.addEventListener('click', () => returnsModal.classList.remove('active'));
  }

  window.addEventListener('click', (e) => {
    if (e.target === mentionsModal) mentionsModal.classList.remove('active');
    if (e.target === returnsModal) returnsModal.classList.remove('active');
  });
});
