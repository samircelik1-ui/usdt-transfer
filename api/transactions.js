export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

const SUPABASE_URL = 'https://wnsdjnribaysltxdgwna.supabase.co';
const SUPABASE_KEY = 'sb_publishable_HIxXI3s9GWCOw_PmnIpDjw_RKUUFdLn';





  if (req.method === 'GET' ) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/transactions?order=timestamp.desc&limit=1000`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Supabase error: ${response.status}`);
      }

      const transactions = await response.json();

      // Trasforma i dati per la dashboard
      const formattedTransactions = transactions.map(tx => ({
        userAddress: tx.user_address,
        txHash: tx.tx_hash,
        amount: tx.amount,
        timestamp: tx.timestamp
      }));

      res.status(200).json({
        success: true,
        transactions: formattedTransactions
      });
    } catch (error) {
      console.error('❌ Error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  } else {
    res.status(404).json({
      error: 'Not found'
    });
  }
}
