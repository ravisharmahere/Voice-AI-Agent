// routes/postRoutes.ts

import { IncomingMessage, ServerResponse } from 'http';
import { makeOutboundCall } from '../outboundCaller';

// Handler for the '/call' POST route
async function handleCallRoute(req: IncomingMessage, res: ServerResponse) {
  let body = '';

  req.on('data', chunk => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const { phoneNumber } = JSON.parse(body);

      if (!phoneNumber) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Phone number is required.' }));
        return;
      }

      const roomName = await makeOutboundCall(phoneNumber);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Call initiated successfully.', roomName }));
    } catch (error) {
      console.error('Error initiating call:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to initiate call.' }));
    }
  });
}

// Main function to handle all POST routes
export async function handlePostRoutes(req: IncomingMessage, res: ServerResponse) {
  switch (req.url) {
    case '/call':
      await handleCallRoute(req, res);
      break;

    // Add more POST routes here as needed

    default:
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'POST route not found.' }));
      break;
  }
}
