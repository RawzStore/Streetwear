document.addEventListener('DOMContentLoaded', () => {
  // 1. Récupérer l'ID du produit dans l'URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = parseInt(urlParams.get('id'), 10);

  // Sécurité : vérifier que la base de données existe
  if (typeof products === 'undefined') {
    console.error("Le tableau 'products' n'est pas accessible.");
    return;
  }

  // 2. Chercher le produit dans le tableau 'products'
  const product = products.find(p => p.id === productId);

  if (!product) {
    const mainContainer = document.querySelector('.product-page-container');
    if (mainContainer) {
      mainContainer.innerHTML = `
        <div style="text-align:center; padding: 50px 20px; width:100%;">
          <h2>Produit introuvable.</h2>
          <a href="index.html" class="checkout-btn" style="display:inline-block; margin-top:15px; text-decoration:none;">Retour à la boutique</a>
        </div>
      `;
    }
    return;
  }

  // 3. Éléments DOM
  const productName = document.getElementById('product-name');
  const productPrice = document.getElementById('product-price');
  const productDescription = document.getElementById('product-description');
  const displayImg = document.getElementById('display-img');
  const thumbnailsContainer = document.getElementById('thumbnails-container');
  
  // Éléments pour les couleurs & vignettes
  const colorGroup = document.getElementById('color-group');
  const colorSwatchesContainer = document.getElementById('color-swatches-container');
  const selectedColorName = document.getElementById('selected-color-name');
  
  const sizeSelect = document.getElementById('size-select');
  const addToCartBtn = document.getElementById('add-to-cart-btn');

  let activeColor = '';

  // 4. Contenu texte
  if (productName) productName.textContent = product.name;
  if (productPrice) productPrice.textContent = `${product.price.toFixed(2)} €`;
  if (productDescription) productDescription.textContent = product.description || '';

  // 5. Gestion de la Galerie d'images
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

  // 6. Injection des Couleurs sous forme de vignettes (Swatches)
  if (colorSwatchesContainer && product.colors && product.colors.length > 0) {
    colorSwatchesContainer.innerHTML = '';
    activeColor = product.colors[0]; // Couleur par défaut

    if (selectedColorName) {
      selectedColorName.textContent = activeColor;
    }

    product.colors.forEach((color, index) => {
      const swatch = document.createElement('img');
      const colorImages = getImagesForColor(color);
      
      // Image de la vignette (1ère image de la couleur ou image principale)
      swatch.src = colorImages[0] || product.mainImage;
      swatch.alt = color;
      swatch.title = color;
      swatch.className = `color-swatch ${index === 0 ? 'active' : ''}`;

      swatch.addEventListener('click', () => {
        activeColor = color;
        if (selectedColorName) selectedColorName.textContent = color;
        
        // Gestion de la classe active sur les vignettes
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        
        // Mise à jour de la galerie principale
        updateGallery(getImagesForColor(color));
      });

      colorSwatchesContainer.appendChild(swatch);
    });
  } else if (colorGroup) {
    colorGroup.style.display = 'none';
  }

  // 7. Injection des Tailles
  if (sizeSelect && product.sizes && product.sizes.length > 0) {
    sizeSelect.innerHTML = '';
    product.sizes.forEach(size => {
      const option = document.createElement('option');
      option.value = size;
      option.textContent = size;
      sizeSelect.appendChild(option);
    });
  } else if (sizeSelect && sizeSelect.parentElement) {
    sizeSelect.parentElement.style.display = 'none';
  }

  // 8. Galerie initiale avec la première couleur
  updateGallery(getImagesForColor(activeColor));

  // 9. Ajout au panier avec notification Toast
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const selectedSize = sizeSelect ? sizeSelect.value : '';

      const cartItemKey = `${product.id}-${selectedSize}-${activeColor}`;
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
          selectedColor: activeColor,
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
