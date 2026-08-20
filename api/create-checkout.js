// Catalogues des prix officiels côté serveur
const productsCatalog = [
  { id: 1, price: 19.99 },
  { id: 2, price: 17.99 },
  { id: 3, price: 17.99 },
  { id: 4, price: 24.99 }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const { cart, deliveryMode, promoCode, email, orderId } = req.body;

    // 1. Calcul du sous-total strict depuis les prix du serveur
    let subtotal = 0;
    if (Array.isArray(cart)) {
      for (const item of cart) {
        const dbProduct = productsCatalog.find(p => p.id === item.id);
        if (dbProduct) {
          subtotal += dbProduct.price * item.quantity;
        }
      }
    }

    // 2. Application du code promo s'il est valide
    if (promoCode === "RAWZ10") {
      subtotal = subtotal * 0.90;
    }

    // 3. Calcul des frais de port
    let shippingCost = 0.00;
    if (deliveryMode === 'Mondial Relay') shippingCost = 3.90;
    if (deliveryMode === 'Colissimo Domicile') shippingCost = 9.50;
    if (subtotal >= 80 || deliveryMode === 'Remise en main propre') shippingCost = 0.00;

    const totalAmount = parseFloat((subtotal + shippingCost).toFixed(2));

    if (isNaN(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ error: 'Montant de commande invalide' });
    }

    // 4. Appel à l'API SumUp
    const response = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUMUP_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        checkout_reference: orderId || `RAWZ-${Date.now()}`,
        amount: totalAmount,
        currency: 'EUR',
        payee_email: process.env.SUMUP_ACCOUNT_EMAIL,
        description: `Commande Rawz Store`,
        customer_email: email
      })
    });

    const data = await response.json();

    if (data.id) {
      return res.status(200).json({ checkoutId: data.id });
    } else {
      return res.status(400).json({ error: 'Erreur création SumUp', details: data });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
}
