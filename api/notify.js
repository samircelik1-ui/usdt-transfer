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

      // Salva il file
import fs from 'fs';
import path from 'path';

const dataFile = path.join(process.cwd(), 'data', 'transactions.json');

function ensureDataDir() {
  const dir = path.dirname(dataFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getTransactions() {
  ensureDataDir();
  if (!fs.existsSync(dataFile)) {
    return [];
  }
  try {
    const data = fs.readFileSync(dataFile, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveTransaction(transaction) {
  ensureDataDir();
  const transactions = getTransactions();
  transactions.push(transaction);
  fs.writeFileSync(dataFile, JSON.stringify(transactions, null, 2));
}

const transaction = {
  id: Date.now(),
  userAddress,
  txHash,
  amount,
  timestamp: new Date().toISOString()
};

saveTransaction(transaction);


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
