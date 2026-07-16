# Trust Wallet Backend - Notifiche Telegram

Backend Node.js per gestire le notifiche Telegram di transazioni USDT.

## Installazione

\`\`\`bash
npm install
\`\`\`

## Sviluppo locale

\`\`\`bash
npm run dev
\`\`\`

Il server sarà disponibile su \`http://localhost:3001\`

## Endpoint

### POST /api/notify

Invia una notifica Telegram per una transazione USDT.

**Request:**
\`\`\`json
{
  "userAddress": "0x...",
  "txHash": "0x...",
  "amount": "100",
  "source": "QR"
}
\`\`\`

**Response (Success ):**
\`\`\`json
{
  "success": true,
  "transferHash": "uuid-string",
  "hash": "uuid-string",
  "message": "Notification sent successfully"
}
\`\`\`

### GET /api/health

Health check endpoint.

**Response:**
\`\`\`json
{
  "status": "ok",
  "timestamp": "2026-01-15T10:30:00.000Z"
}
\`\`\`

## Deploy su Vercel

1. Crea un repository GitHub con questo codice
2. Collegalo a Vercel
3. Vercel deployerà automaticamente

L'endpoint sarà disponibile su: \`https://your-project.vercel.app/api/notify\`
