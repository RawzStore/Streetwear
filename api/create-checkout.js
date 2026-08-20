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
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const bodyData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { cart, deliveryMode, promoCode, email, orderId } = bodyData || {};

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      console.log("ERREUR: Panier invalide ou absent", bodyData);
      return res.status(400).json({ error: 'Panier invalide' });
    }

    // 1. Calcul du sous-total strict
    let subtotal = 0;
    for (const item of cart) {
      const dbProduct = productsCatalog.find(p => p.id === Number(item.id));
      if (dbProduct) {
        subtotal += dbProduct.price * (item.quantity || 1);
      }
    }

    // 2. Code promo
    if (promoCode === "RAWZ10") {
      subtotal = subtotal * 0.90;
    }

    // 3. Frais de port
    let shippingCost = 0.00;
    if (deliveryMode === 'Mondial Relay') shippingCost = 3.90;
    if (deliveryMode && deliveryMode.includes('Colissimo')) shippingCost = 9.50;
    if (subtotal >= 80 || (deliveryMode && deliveryMode.includes('Remise en main propre'))) shippingCost = 0.00;

    const totalAmount = parseFloat((subtotal + shippingCost).toFixed(2));

    console.log("Calcul effectué:", { subtotal, shippingCost, totalAmount });

    // 4. Log de contrôle de la clé d'API
    const apiKey = process.env.SUMUP_SECRET_KEY;
    console.log("Cle detectee :", apiKey ? `${apiKey.trim().substring(0, 8)}...` : "AUCUNE CLE TROUVÉE");

    // 5. Payload SumUp corrigé
    const sumupPayload = {
      checkout_reference: orderId || `RAWZ-${Date.now()}`,
      amount: totalAmount,
      currency: 'EUR',
      pay_to_email: process.env.SUMUP_ACCOUNT_EMAIL,
      description: `Commande Rawz Store`
    };

    if (email && email.trim() !== '') {
      sumupPayload.customer_email = email.trim();
    }

    const sumupResponse = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey ? apiKey.trim() : ''}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sumupPayload)
    });

    const data = await sumupResponse.json();
    console.log("Réponse SumUp:", data);

    if (data.id) {
      return res.status(200).json({ checkoutId: data.id });
    } else {
      console.error("Erreur SumUp détaillée:", data);
      return res.status(400).json({ error: 'Erreur création SumUp', details: data });
    }
  } catch (error) {
    console.error("Erreur serveur interne:", error);
    return res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
}
