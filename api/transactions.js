export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const kv_url = process.env.KV_REST_API_URL;
      const kv_token = process.env.KV_REST_API_TOKEN;

      // Leggi l'elenco dei transaction IDs
      const listResponse = await fetch(`${kv_url}/lrange/transactions/0/-1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${kv_token}`
        }
      });

      const listData = await listResponse.json();
      const transactionIds = listData.result || [];

      // Leggi tutti i transaction
      const transactions = [];
      for (const id of transactionIds) {
        const txResponse = await fetch(`${kv_url}/get/transaction:${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${kv_token}`
          }
        });

        const txData = await txResponse.json();
        if (txData.result) {
          transactions.push(JSON.parse(txData.result));
        }
      }

      res.status(200).json({
        success: true,
        transactions: transactions
      });

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  } else {
    res.status(404).json({ error: 'Not found' });
  }
}
