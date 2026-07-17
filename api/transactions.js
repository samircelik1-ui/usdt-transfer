import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://celiksamir5_db_user:ZL3QmMmLVxBgdR1a@usdt-transfer.l0meppt.mongodb.net/?appName=usdt-transfer';

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

async function getTransactions() {
  try {
    const client = await connectToDatabase();
    const db = client.db('usdt-transfer');
    const collection = db.collection('transactions');

    const transactions = await collection
      .find({})
      .sort({ timestamp: -1 })
      .limit(1000)
      .toArray();

    return transactions;
  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    throw error;
  }
}

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

  if (req.method === 'GET') {
    try {
      const transactions = await getTransactions();
      res.status(200).json({
        success: true,
        transactions: transactions
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