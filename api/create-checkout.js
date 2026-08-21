import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const productsCatalog = [
  { id: 1, name: "Chemise à Carreaux", price: 1999 },
  { id: 2, name: "Polo Rayures", price: 1799 },
  { id: 3, name: "Polo Baggy Court", price: 1799 },
  { id: 4, name: "T-Shirt Tricoté", price: 2499 }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Méthode non autorisée' });

  try {
    const bodyData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { cart, deliveryMode, promoCode, email, customerDetails } = bodyData || {};

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Panier invalide' });
    }

    // 1. Calcul des articles pour Stripe
    const lineItems = cart.map(item => {
      const dbProduct = productsCatalog.find(p => p.id === Number(item.id));
      const priceInCents = dbProduct ? dbProduct.price : 1999;
      const productName = dbProduct ? dbProduct.name : (item.name || `Article #${item.id}`);

      // Variantes (Taille / Couleur)
      const variantDetails = [];
      if (item.selectedSize) variantDetails.push(`Taille: ${item.selectedSize}`);
      if (item.selectedColor) variantDetails.push(`Coloris: ${item.selectedColor}`);
      const descriptionText = variantDetails.length > 0 ? variantDetails.join(' | ') : 'Taille unique';

      return {
        price_data: {
          currency: 'eur',
          product_data: { 
            name: productName,
            description: descriptionText
          },
          unit_amount: promoCode === "RAWZ10" ? Math.round(priceInCents * 0.90) : priceInCents,
        },
        quantity: item.quantity || 1,
      };
    });

    // 2. Frais de port
    let shippingCost = 0;
    if (deliveryMode === 'Mondial Relay') shippingCost = 390;
    if (deliveryMode && deliveryMode.includes('Colissimo')) shippingCost = 950;

    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: `Livraison (${deliveryMode})` },
          unit_amount: shippingCost,
        },
        quantity: 1,
      });
    }

    // Objets métadonnées centralisés
    const orderMetadata = {
      prenom: customerDetails?.firstname || 'Non renseigné',
      nom: customerDetails?.lastname || 'Non renseigné',
      telephone: customerDetails?.phone || 'Non renseigné',
      adresse: customerDetails?.address || 'Non renseignée',
      code_postal: customerDetails?.zipcode || 'Non renseigné',
      ville: customerDetails?.city || 'Non renseignée',
      mode_livraison: deliveryMode || 'Non renseigné',
      point_relais: customerDetails?.relayInfo || 'Non applicable',
    };

    // 3. Création de la session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: email || undefined,

      // Transmet aussi les métadonnées au Payment Intent (pi_...)
      payment_intent_data: {
        metadata: orderMetadata,
      },

      // Métadonnées au niveau de la Checkout Session (cs_...)
      metadata: orderMetadata,

      success_url: 'https://rawz-store.vercel.app/?success=true',
      cancel_url: 'https://rawz-store.vercel.app/?cancel=true',
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Erreur Stripe :", error);
    return res.status(500).json({ error: error.message });
  }
}
