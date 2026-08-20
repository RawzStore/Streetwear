// api/create-checkout.js
export default async function handler(req, res) {
  // Autoriser les requêtes depuis ton site GitHub Pages
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

  const { amount, currency, orderId, email } = req.body;

  try {
    const response = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUMUP_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        checkout_reference: orderId || `RAWZ-${Date.now()}`,
        amount: parseFloat(amount),
        currency: currency || 'EUR',
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
