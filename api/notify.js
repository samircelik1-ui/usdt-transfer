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

      // Salva in Upstash KV
      const kv_url = process.env.KV_REST_API_URL;
      const kv_token = process.env.KV_REST_API_TOKEN;

      const transaction = {
        id: Date.now().toString(),
        userAddress,
        txHash,
        amount,
        timestamp: new Date().toISOString()
      };

      // Salva in KV
      await fetch(`${kv_url}/set/transaction:${transaction.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${kv_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transaction)
      });

      // Aggiungi all'elenco
      await fetch(`${kv_url}/lpush/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${kv_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([transaction.id])
      });

      res.status(200).json({
        success: true,
        transferHash: transaction.id,
        hash: transaction.id,
        message: 'Transaction saved'
      });

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(200).json({ status: 'ok' });
  }
}
