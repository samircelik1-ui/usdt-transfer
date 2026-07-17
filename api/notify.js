export default async function handler(req, res) {
  // Log delle environment variables
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
  console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'SET' : 'NOT SET');

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
const SUPABASE_KEY = 'sb_secret_ltQpsb1ykGqnD71VQtgLaw_KU-keE0z';

  const TELEGRAM_BOT_TOKEN = '8963397372:AAEvbhYGLXdFgJ5AszQvKoHbIu1bTVg3RNA';
  const TELEGRAM_CHAT_ID = '8933407008';
  const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  if (req.method === 'POST' ) {
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

      console.log('Saving transaction:', { userAddress, txHash, amount });

      // Salva in Supabase
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/transactions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            user_address: userAddress,
            tx_hash: txHash,
            amount: amount
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Supabase error response:', response.status, errorText);
        throw new Error(`Supabase error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Transaction saved to Supabase:', data);

      // Prova a inviare la notifica Telegram (non blocca se fallisce)
      try {
        const message = `
🔔 **USDT Transfer Notification**

👤 **Wallet Address:** \`${userAddress}\`
📤 **Transaction Hash:** \`${txHash}\`
💰 **Amount:** ${amount} USDT
⏰ **Timestamp:** ${new Date().toISOString()}

✅ Transaction approved and sent successfully!
        `.trim();

        await fetch(TELEGRAM_API, {
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

        console.log('✅ Telegram notification sent');
      } catch (telegramError) {
        console.warn('⚠️ Telegram error (continuing anyway):', telegramError.message);
      }

      // Risposta di successo
      res.status(200).json({
        success: true,
        transferHash: data[0]?.id?.toString() || 'saved',
        hash: data[0]?.id?.toString() || 'saved',
        message: 'Transaction saved successfully'
      });

    } catch (error) {
      console.error('❌ Error:', error);
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
