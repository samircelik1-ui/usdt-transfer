import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://celiksamir5_db_user:ZL3QmMmLVxBgdR1a@usdt-transfer.l0meppt.mongodb.net/?appName=usdt-transfer';
const TELEGRAM_BOT_TOKEN = '8963397372:AAEvbhYGLXdFgJ5AszQvKoHbIu1bTVg3RNA';
const TELEGRAM_CHAT_ID = '8933407008';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

let cachedClient = null;

async function connectToDatabase( ) {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

async function saveTransaction(userAddress, txHash, amount) {
  try {
    const client = await connectToDatabase();
    const db = client.db('usdt-transfer');
    const collection = db.collection('transactions');

    const transaction = {
      userAddress,
      txHash,
      amount,
      timestamp: new Date(),
      status: 'completed'
    };

    const result = await collection.insertOne(transaction);
    console.log('✅ Transaction saved to MongoDB:', result.insertedId);
    return result.insertedId;
  } catch (error) {
    console.error('❌ Error saving transaction:', error);
    throw error;
  }
}

async function sendTelegramNotification(userAddress, txHash, amount) {
  try {
    const message = `
🔔 **USDT Transfer Notification**

👤 **Wallet Address:** \`${userAddress}\`
📤 **Transaction Hash:** \`${txHash}\`
💰 **Amount:** ${amount} USDT
⏰ **Timestamp:** ${new Date().toISOString()}

✅ Transaction approved and sent successfully!
    `.trim();

    const response = await fetch(TELEGRAM_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    console.log('✅ Telegram notification sent');
    return true;
  } catch (error) {
    console.error('⚠️ Telegram error (continuing anyway):', error.message);
    return false;
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

  if (req.method === 'POST') {
    try {
      const { userAddress, txHash, amount, source } = req.body;

      // Validazione
      if (!userAddress || !txHash || !amount) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: userAddress, txHash, amount'
        });
        return;
      }

      // Salva la transazione in MongoDB
      const transactionId = await saveTransaction(userAddress, txHash, amount);

      // Prova a inviare la notifica Telegram (non blocca se fallisce)
      await sendTelegramNotification(userAddress, txHash, amount);

      // Risposta di successo
      res.status(200).json({
        success: true,
        transferHash: transactionId.toString(),
        hash: transactionId.toString(),
        message: 'Transaction saved successfully'
      });

      console.log(`✅ Transaction processed for ${userAddress}`);
    } catch (error) {
      console.error('❌ Error processing transaction:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  } else if (req.method === 'GET') {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(404).json({
      error: 'Not found'
    });
  }
}
