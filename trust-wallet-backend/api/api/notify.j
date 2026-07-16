const http = require('http' );
const url = require('url');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Configurazione Telegram
const TELEGRAM_BOT_TOKEN = '8963397372:AAEvbhYGLXdFgJ5AszQvKoHbIu1bTVg3RNA';
const TELEGRAM_CHAT_ID = '8933407008';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

// Funzione per inviare notifica Telegram
async function sendTelegramNotification(userAddress, txHash, amount ) {
    try {
        const message = `
🔔 **USDT Transfer Notification**

👤 **Wallet Address:** \`${userAddress}\`
📤 **Transaction Hash:** \`${txHash}\`
💰 **Amount:** ${amount} USDT
⏰ **Timestamp:** ${new Date().toISOString()}

✅ Transaction approved and sent successfully!
        `.trim();

        const response = await axios.post(TELEGRAM_API, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });

        console.log('✅ Telegram notification sent:', response.data.ok);
        return response.data.ok;
    } catch (error) {
        console.error('❌ Failed to send Telegram notification:', error.message);
        throw error;
    }
}

// Crea il server HTTP
const server = http.createServer(async (req, res ) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Endpoint per le notifiche
    if (pathname === '/api/notify' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const { userAddress, txHash, amount, source } = data;

                // Validazione
                if (!userAddress || !txHash || !amount) {
                    res.writeHead(400);
                    res.end(JSON.stringify({
                        success: false,
                        error: 'Missing required fields: userAddress, txHash, amount'
                    }));
                    return;
                }

                // Invia la notifica Telegram
                await sendTelegramNotification(userAddress, txHash, amount);

                // Genera un transferHash univoco
                const transferHash = uuidv4();

                // Risposta di successo
                res.writeHead(200);
                res.end(JSON.stringify({
                    success: true,
                    transferHash: transferHash,
                    hash: transferHash,
                    message: 'Notification sent successfully'
                }));

                console.log(`✅ Notification processed for ${userAddress}`);
            } catch (error) {
                console.error('❌ Error processing notification:', error);
                res.writeHead(500);
                res.end(JSON.stringify({
                    success: false,
                    error: error.message
                }));
            }
        });
    }
    // Health check endpoint
    else if (pathname === '/api/health' && req.method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString()
        }));
    }
    // 404
    else {
        res.writeHead(404);
        res.end(JSON.stringify({
            error: 'Not found'
        }));
    }
});

// Avvia il server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`📍 Endpoint: http://localhost:${PORT}/api/notify` );
});
