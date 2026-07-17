export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { userAddress, txHash, amount } = req.body;

      if (!userAddress || !txHash || !amount) {
        res.status(400).json({ success: false, error: 'Missing fields' });
        return;
      }

      // Salva in memoria (per questo test)
      const transaction = {
        id: Date.now(),
        userAddress,
        txHash,
        amount,
        timestamp: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        transferHash: transaction.id.toString(),
        hash: transaction.id.toString(),
        message: 'Transaction saved'
      });

    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(200).json({ status: 'ok' });
  }
}
