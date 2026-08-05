document.addEventListener('DOMContentLoaded', () => {
  // 1. Récupération de l'ID du produit dans l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  // 2. Vérification si le tableau 'products' existe (défini dans script.js)
  if (typeof products === 'undefined') {
    console.error("Le tableau 'products' est introuvable. Vérifie que script.js est bien chargé avant product-detail.js.");
    return;
  }

  // 3. Recherche du produit
  const product = products.find(p => p.id === productId);

  if (!product) {
    const container = document.querySelector('.product-page-container');
    if (container) {
      container.innerHTML = "<h2>Produit introuvable.</h2><a href='index.html'>Retour au catalogue</a>";
    }
    return;
  }

  // 4. Injection des infos de base
  const productName = document.getElementById('product-name');
  const productPrice = document.getElementById('product-price');
  const productDesc = document.getElementById('product-description');
  const displayImg = document.getElementById('display-img');
  
  if (productName) productName.textContent = product.name;
  if (productPrice) productPrice.textContent = `${product.price.toFixed(2)} €`;
  if (productDesc) productDesc.textContent = product.description || "Aucune description disponible.";
  
  if (displayImg && product.images && product.images.length > 0) {
    displayImg.src = product.images[0];
    displayImg.alt = product.name;
  }

  // 5. Remplissage des selecteurs Couleur & Taille
  const colorSelect = document.getElementById('color-select');
  const sizeSelect = document.getElementById('size-select');

  if (colorSelect && product.colors) {
    colorSelect.innerHTML = product.colors.map(c => `<option value="${c}">${c}</option>`).join('');
  }

  if (sizeSelect && product.sizes) {
    sizeSelect.innerHTML = product.sizes.map(s => `<option value="${s}">${s}</option>`).join('');
  }

  // 6. Remplissage des vignettes photos
  const thumbnailsContainer = document.getElementById('thumbnails-container');
  if (thumbnailsContainer && product.images) {
    thumbnailsContainer.innerHTML = product.images.map((imgSrc, index) => `
      <img src="${imgSrc}" alt="Vignette ${index + 1}" class="thumbnail-img ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${imgSrc}', this)">
    `).join('');
  }

  // 7. Gestion de l'ajout au panier
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const selectedSize = sizeSelect ? sizeSelect.value : '';
      const selectedColor = colorSelect ? colorSelect.value : '';

      const itemToAdd = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        selectedSize: selectedSize,
        selectedColor: selectedColor,
        quantity: 1
      };

      const existingIndex = cart.findIndex(item => 
        item.id === itemToAdd.id && 
        item.selectedSize === itemToAdd.selectedSize && 
        item.selectedColor === itemToAdd.selectedColor
      );

      if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push(itemToAdd);
      }

      if (typeof saveCart === 'function') saveCart();
      if (typeof updateCartUI === 'function') updateCartUI();

      showToast();
      if (typeof openCart === 'function') openCart();
    });
  }
});

// Fonction pour changer l'image principale au clic sur une vignette
function changeMainImage(src, element) {
  const displayImg = document.getElementById('display-img');
  if (displayImg) displayImg.src = src;

  document.querySelectorAll('.thumbnail-img').forEach(img => img.classList.remove('active'));
  if (element) element.classList.add('active');
}

// Fonction Toast
function showToast() {
  const toast = document.getElementById('toast-notification');
  if (!toast) return;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

