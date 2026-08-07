document.addEventListener('DOMContentLoaded', () => {
  // 1. Récupérer l'ID du produit dans l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id'), 10);

  // 2. Chercher le produit dans le tableau 'products'
  const product = products.find(p => p.id === productId);

  if (!product) {
    const mainContainer = document.querySelector('.product-page-container');
    if (mainContainer) {
      mainContainer.innerHTML = '<h2>Produit introuvable.</h2><a href="index.html">Retour à la boutique</a>';
    }
    return;
  }

  // 3. Éléments DOM
  const productName = document.getElementById('product-name');
  const productPrice = document.getElementById('product-price');
  const productDescription = document.getElementById('product-description');
  const displayImg = document.getElementById('display-img');
  const mainImgContainer = document.querySelector('.main-image-container');
  const thumbnailsContainer = document.getElementById('thumbnails-container');
  const colorSelect = document.getElementById('color-select');
  const sizeSelect = document.getElementById('size-select');
  const addToCartBtn = document.getElementById('add-to-cart-btn');

  // 4. Contenu texte
  if (productName) productName.textContent = product.name;
  if (productPrice) productPrice.textContent = `${product.price.toFixed(2)} €`;
  if (productDescription) productDescription.textContent = product.description;

  // 5. Effet de Zoom (Souris + Tactile Mobile)
  if (mainImgContainer && displayImg) {
    
    // Fonction centrale pour calculer le zoom
    const applyZoom = (clientX, clientY) => {
      const rect = mainImgContainer.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;

      displayImg.style.transformOrigin = `${x}% ${y}%`;
      displayImg.style.transform = 'scale(2)';
    };

    const resetZoom = () => {
      displayImg.style.transform = 'scale(1)';
      displayImg.style.transformOrigin = 'center center';
    };

    // --- PC (Souris) ---
    mainImgContainer.addEventListener('mousemove', (e) => applyZoom(e.clientX, e.clientY));
    mainImgContainer.addEventListener('mouseleave', resetZoom);

    // --- MOBILE (Tactile) ---
    mainImgContainer.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        // Empêche le défilement de la page pendant qu'on glisse le doigt sur l'image
        e.preventDefault(); 
        const touch = e.touches[0];
        applyZoom(touch.clientX, touch.clientY);
      }
    }, { passive: false });

    mainImgContainer.addEventListener('touchend', resetZoom);
    mainImgContainer.addEventListener('touchcancel', resetZoom);
  }

  // 6. Gestion de la Galerie d'images
  function updateGallery(imagesList) {
    if (!imagesList || imagesList.length === 0) return;

    if (displayImg) {
      displayImg.src = imagesList[0];
      displayImg.alt = product.name;
    }

    if (thumbnailsContainer) {
      thumbnailsContainer.innerHTML = '';

      imagesList.forEach((imgSrc, index) => {
        const thumb = document.createElement('img');
        thumb.src = imgSrc;
        thumb.alt = `${product.name} - Vue ${index + 1}`;
        thumb.className = `thumbnail ${index === 0 ? 'active' : ''}`;

        thumb.addEventListener('click', () => {
          if (displayImg) displayImg.src = imgSrc;
          document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
        });

        thumbnailsContainer.appendChild(thumb);
      });
    }
  }

  function getImagesForColor(color) {
    if (product.imagesByColor && product.imagesByColor[color]) {
      return product.imagesByColor[color];
    }
    return product.images || [product.mainImage];
  }

  // 7. Injection des Couleurs
  if (colorSelect && product.colors && product.colors.length > 0) {
    colorSelect.innerHTML = '';
    product.colors.forEach(color => {
      const option = document.createElement('option');
      option.value = color;
      option.textContent = color;
      colorSelect.appendChild(option);
    });

    colorSelect.addEventListener('change', (e) => {
      updateGallery(getImagesForColor(e.target.value));
    });
  } else if (colorSelect) {
    colorSelect.parentElement.style.display = 'none';
  }

  // 8. Injection des Tailles
  if (sizeSelect && product.sizes && product.sizes.length > 0) {
    sizeSelect.innerHTML = '';
    product.sizes.forEach(size => {
      const option = document.createElement('option');
      option.value = size;
      option.textContent = size;
      sizeSelect.appendChild(option);
    });
  } else if (sizeSelect) {
    sizeSelect.parentElement.style.display = 'none';
  }

  // 9. Galerie initiale
  const initialColor = colorSelect ? colorSelect.value : null;
  updateGallery(getImagesForColor(initialColor));

  // 10. Ajout au panier avec notification Toast
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const selectedColor = colorSelect ? colorSelect.value : '';
      const selectedSize = sizeSelect ? sizeSelect.value : '';

      const cartItemKey = `${product.id}-${selectedSize}-${selectedColor}`;
      const existingItem = cart.find(item => item.key === cartItemKey);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: displayImg ? displayImg.src : product.mainImage,
          selectedSize: selectedSize,
          selectedColor: selectedColor,
          key: cartItemKey,
          quantity: 1
        });
      }

      if (typeof saveCart === 'function') saveCart();
      if (typeof updateCartUI === 'function') updateCartUI();

      showToast();
    });
  }

  function showToast() {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;

    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
});
