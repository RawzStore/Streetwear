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

let cart = JSON.parse(localStorage.getItem('rawz_cart')) || [];
let appliedDiscount = 0;

// Fonctions Menu Burger
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

// Ouverture & fermeture Panier
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

// Modale Checkout
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
    setTimeout(() => {
      initPayPalButton();
    }, 100);
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.remove('active');
}

// Calculer et afficher le récapitulatif du prix en temps réel
function updateCheckoutSummary() {
  let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  let discountedSubtotal = subtotal * (1 - appliedDiscount);

  const selectedMode = document.querySelector('input[name="mode_de_livraison"]:checked')?.value || 'Mondial Relay';
  let shippingCost = 0.00;

  if (selectedMode === 'Mondial Relay') {
    shippingCost = 4.50;
  } else if (selectedMode === 'Colissimo Domicile') {
    shippingCost = 6.90;
  } else if (selectedMode === 'Remise en main propre') {
    shippingCost = 0.00;
  }

  // Offrir la livraison si sous-total >= 80€ (hors remise en main propre)
  if (discountedSubtotal >= 80 && selectedMode !== 'Remise en main propre') {
    shippingCost = 0.00;
  }

  const finalTotal = discountedSubtotal + shippingCost;

  const subtotalEl = document.getElementById('summary-subtotal');
  const shippingEl = document.getElementById('summary-shipping');
  const totalEl = document.getElementById('summary-total');

  if (subtotalEl) subtotalEl.textContent = `${discountedSubtotal.toFixed(2).replace('.', ',')} €`;
  if (shippingEl) {
    if (shippingCost === 0 && selectedMode !== 'Remise en main propre') {
      shippingEl.textContent = 'Offerte (dès 80€)';
    } else if (shippingCost === 0 && selectedMode === 'Remise en main propre') {
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

// Obtenir la valeur brute des frais de livraison
function getShippingCost() {
  return updateCheckoutSummary().shippingCost;
}

// --- LOGIQUE WIDGET MONDIAL RELAY ---
function initMondialRelayWidget() {
  const zipcode = document.getElementById('client-zipcode')?.value.trim() || '75001';

  if (typeof $ === 'undefined') {
    alert("jQuery n'est pas chargé sur la page.");
    return;
  }

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
      OnParcelShopSelected: function(data) {
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
      }
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
      OnParcelShopSelected: function(data) {
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
      }
    });
  } else {
    alert("Le script Mondial Relay ne s'est pas chargé correctement.");
  }
}

function toggleMondialRelayZone() {
  const selectedMode = document.querySelector('input[name="mode_de_livraison"]:checked')?.value;
  const mrZone = document.getElementById('zone-mondial-relay');

  if (mrZone) {
    if (selectedMode === 'Mondial Relay') {
      mrZone.style.display = 'block';
    } else {
      mrZone.style.display = 'none';
    }
  }
}

function validateDeliverySelection() {
  const selectedMode = document.querySelector('input[name="mode_de_livraison"]:checked')?.value;
  if (selectedMode === 'Mondial Relay') {
    const relayId = document.getElementById('mr-relay-id')?.value;
    if (!relayId) {
      alert("Merci de choisir un Point Relais sur la carte Mondial Relay avant de continuer.");
      return false;
    }
  }
  return true;
}

// INTÉGRATION ET INITIALISATION BOUTONS PAYPAL
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
    onClick: function(data, actions) {
      const form = document.getElementById('checkout-form');
      if (form && !form.checkValidity()) {
        form.reportValidity();
        return actions.reject();
      }

      if (!validateDeliverySelection()) {
        return actions.reject();
      }

      return actions.resolve();
    },
    createOrder: function(data, actions) {
      const summary = updateCheckoutSummary();
      const total = summary.total.toFixed(2);

      const firstname = document.getElementById('client-firstname')?.value.trim() || '';
      const lastname = document.getElementById('client-lastname')?.value.trim() || '';
      const email = document.getElementById('client-email')?.value.trim() || '';
      const rawPhone = document.getElementById('client-phone')?.value.trim().replace(/\s+/g, '') || '';
      const address = document.getElementById('client-address')?.value.trim() || '';
      const zipcode = document.getElementById('client-zipcode')?.value.trim() || '';
      const city = document.getElementById('client-city')?.value.trim() || '';

      const formattedPhone = rawPhone.replace(/^(\+33|0)/, '');

      return actions.order.create({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            value: total,
            currency_code: 'EUR'
          },
          shipping: {
            name: { full_name: `${firstname} ${lastname}` },
            address: {
              address_line_1: address,
              admin_area_2: city,
              postal_code: zipcode,
              country_code: 'FR'
            }
          }
        }],
        payer: {
          name: { given_name: firstname, surname: lastname },
          email_address: email,
          phone: formattedPhone ? {
            phone_type: 'MOBILE',
            phone_number: { national_number: formattedPhone }
          } : undefined,
          address: {
            address_line_1: address,
            admin_area_2: city,
            postal_code: zipcode,
            country_code: 'FR'
          }
        }
      });
    },
    onApprove: function(data, actions) {
      return actions.order.capture().then(async function(details) {
        const firstname = document.getElementById('client-firstname')?.value.trim() || '';
        const lastname = document.getElementById('client-lastname')?.value.trim() || '';
        const email = document.getElementById('client-email')?.value.trim() || '';
        const phone = document.getElementById('client-phone')?.value.trim() || '';
        const address = document.getElementById('client-address')?.value.trim() || '';
        const zipcode = document.getElementById('client-zipcode')?.value.trim() || '';
        const city = document.getElementById('client-city')?.value.trim() || '';
        const deliveryMode = document.querySelector('input[name="mode_de_livraison"]:checked')?.value || 'Non spécifié';

        const relayId = document.getElementById('mr-relay-id')?.value || '';
        const relayName = document.getElementById('mr-relay-name')?.value || '';
        const relayAddress = document.getElementById('mr-relay-address')?.value || '';

        let orderDetails = cart.map(item => 
          `- ${item.name} | Taille: ${item.selectedSize} ${item.selectedColor ? '| Coloris: ' + item.selectedColor : ''} | Qte: ${item.quantity} | Prix: ${(item.price * item.quantity).toFixed(2)}€`
        ).join('\n');

        const summary = updateCheckoutSummary();

        // Envoi propre sans doublons à Formspree
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
          "10_TOTAL_PAYE": `${summary.total.toFixed(2)} €`,
          "11_Transaction_PayPal_ID": details.id
        };

        const paypalBtnContainer = document.getElementById('paypal-button-container');
        if (paypalBtnContainer) {
          paypalBtnContainer.innerHTML = '<p style="text-align:center; padding:15px; font-weight:bold;">Validation de la commande en cours...</p>';
        }

        try {
          const response = await fetch("https://formspree.io/f/xgaweybe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify(formData)
          });

          if (response.ok) {
            alert(`Merci ${details.payer.name.given_name} ! Ta commande a été validée avec succès.`);
          } else {
            alert(`Paiement PayPal réussi (ID: ${details.id}), mais une erreur est survenue lors de l'enregistrement.`);
          }
        } catch (e) {
          console.error("Erreur de sauvegarde Formspree", e);
          alert(`Paiement réussi (ID: ${details.id}), mais la confirmation n'a pas pu être envoyée automatiquement.`);
        } finally {
          cart = [];
          saveCart();
          updateCartUI();
          closeCheckoutModal();
          closeCart();

          const form = document.getElementById('checkout-form');
          if (form) form.reset();
        }
      });
    },
    onError: function(err) {
      console.error(err);
      alert("Une erreur est survenue lors du paiement PayPal.");
    }
  }).render('#paypal-button-container');
}

// LOGIQUE SPÉCIFIQUE À LA PAGE PRODUIT (product.html)
function initProductPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id'), 10);
  if (isNaN(productId)) return;

  const product = products.find(p => p.id === productId);
  if (!product) return;

  // Ciblage des éléments (prend en compte product.html et product-detail.html)
  const titleEl = document.getElementById('product-title') || document.getElementById('product-name');
  const priceEl = document.getElementById('product-price');
  const descEl = document.getElementById('product-description');
  const mainImgEl = document.getElementById('main-product-img') || document.getElementById('display-img');
  const thumbsContainer = document.getElementById('thumbnails-container');
  const colorSwatchesContainer = document.getElementById('color-swatches-container');
  const selectedColorName = document.getElementById('selected-color-name');
  const sizeSelect = document.getElementById('size-select');
  const addToCartBtn = document.getElementById('add-to-cart-btn');

  let activeColor = (product.colors && product.colors.length > 0) ? product.colors[0] : '';

  if (titleEl) titleEl.textContent = product.name;
  if (priceEl) priceEl.textContent = `${product.price.toFixed(2)} €`;
  if (descEl) descEl.textContent = product.description;
  if (mainImgEl) mainImgEl.src = product.mainImage;

  // Tailles
  if (sizeSelect && product.sizes) {
    sizeSelect.innerHTML = product.sizes.map(s => `<option value="${s}">${s}</option>`).join('');
  }

  // Fonction de mise à jour de la galerie principale
  const updateGallery = (imageList) => {
    if (!thumbsContainer || !mainImgEl || !imageList || imageList.length === 0) return;
    thumbsContainer.innerHTML = '';
    mainImgEl.src = imageList[0];

    imageList.forEach((imgSrc, index) => {
      const thumb = document.createElement('img');
      thumb.src = imgSrc;
      thumb.className = `thumbnail ${index === 0 ? 'active' : ''}`;
      
      thumb.addEventListener('click', () => {
        mainImgEl.src = imgSrc;
        document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
      thumbsContainer.appendChild(thumb);
    });
  };

  // Récupérer les images associées à une couleur
  const getImagesForColor = (color) => {
    if (product.imagesByColor && product.imagesByColor[color]) {
      return product.imagesByColor[color];
    }
    return product.images || [product.mainImage];
  };

  // Injection des vignettes de couleurs (Swatches)
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

        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');

        updateGallery(getImagesForColor(color));
      });

      colorSwatchesContainer.appendChild(swatch);
    });
  }

  // Chargement de la galerie initiale
  updateGallery(getImagesForColor(activeColor));

  // Ajouter au panier
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const selectedSize = sizeSelect ? sizeSelect.value : (product.sizes ? product.sizes[0] : '');
      const cartKey = `${product.id}-${selectedSize}-${activeColor || 'default'}`;

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
          quantity: 1
        });
      }

      saveCart();
      updateCartUI();

      // Notification Toast si présente
      const toast = document.getElementById('toast-notification');
      if (toast) {
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
      }
    });
  }

  // Accordéons
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

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
  renderProducts(products);
  updateCartUI();
  initProductPage();
  toggleMondialRelayZone();

  // Écoute des changements de mode de livraison pour recalculer et recharger PayPal & Mondial Relay
  document.querySelectorAll('input[name="mode_de_livraison"]').forEach(radio => {
    radio.addEventListener('change', () => {
      updateCheckoutSummary();
      initPayPalButton();
      toggleMondialRelayZone();
    });
  });

  // Bouton d'ouverture / recherche Mondial Relay
  const openMrBtn = document.getElementById('open-mr-widget-btn');
  if (openMrBtn) {
    openMrBtn.addEventListener('click', (e) => {
      e.preventDefault();
      initMondialRelayWidget();
    });
  }

  // Mode sombre
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      document.documentElement.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');
      themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
    });
  }

  // Événements Panier
  const cartToggleBtn = document.getElementById('cart-toggle-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartOverlay = document.getElementById('cart-overlay');

  if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Appliquer le Code Promo
  const applyPromoBtn = document.getElementById('apply-promo-btn');
  const promoInput = document.getElementById('promo-input');
  const promoMsg = document.getElementById('promo-msg');

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
      initPayPalButton();
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

  // Burger Menu
  const burgerToggle = document.getElementById('burger-toggle');
  const closeMenuBtn = document.getElementById('close-menu');
  const menuOverlay = document.getElementById('menu-overlay');

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

  // Modales du Footer
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
