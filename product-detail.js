document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (typeof products === 'undefined') {
    console.error("Le tableau 'products' est introuvable dans script.js");
    return;
  }

  const product = products.find(p => String(p.id) === String(productId));

  if (!product) {
    return;
  }

  const productName = document.getElementById('product-name');
  const productPrice = document.getElementById('product-price');
  const productDesc = document.getElementById('product-description');
  const displayImg = document.getElementById('display-img');

  if (productName) productName.textContent = product.name;
  if (productPrice) productPrice.textContent = `${Number(product.price).toFixed(2)} €`;
  if (productDesc) productDesc.textContent = product.description || "";

  const mainImageSrc = (product.images && product.images.length > 0) ? product.images[0] : (product.image || '');
  if (displayImg && mainImageSrc) {
    displayImg.src = mainImageSrc;
    displayImg.alt = product.name;
  }

  const colorSelect = document.getElementById('color-select');
  const sizeSelect = document.getElementById('size-select');

  if (colorSelect && product.colors) {
    colorSelect.innerHTML = product.colors.map(c => `<option value="${c}">${c}</option>`).join('');
  }

  if (sizeSelect && product.sizes) {
    sizeSelect.innerHTML = product.sizes.map(s => `<option value="${s}">${s}</option>`).join('');
  }

  const thumbnailsContainer = document.getElementById('thumbnails-container');
  if (thumbnailsContainer && product.images && product.images.length > 0) {
    thumbnailsContainer.innerHTML = product.images.map((imgSrc, index) => `
      <img src="${imgSrc}" alt="" class="thumbnail-img ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${imgSrc}', this)">
    `).join('');
  }

  const addToCartBtn = document.getElementById('add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const selectedSize = sizeSelect ? sizeSelect.value : '';
      const selectedColor = colorSelect ? colorSelect.value : '';

      const itemToAdd = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: mainImageSrc,
        selectedSize: selectedSize,
        selectedColor: selectedColor,
        quantity: 1
      };

      const existingIndex = cart.findIndex(item => 
        String(item.id) === String(itemToAdd.id) && 
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

function changeMainImage(src, element) {
  const displayImg = document.getElementById('display-img');
  if (displayImg) displayImg.src = src;

  document.querySelectorAll('.thumbnail-img').forEach(img => img.classList.remove('active'));
  if (element) element.classList.add('active');
}

function showToast() {
  const toast = document.getElementById('toast-notification');
  if (!toast) return;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
