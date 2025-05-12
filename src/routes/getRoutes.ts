// routes/getRoutes.ts

import { IncomingMessage, ServerResponse } from 'http';

// Handler for the '/status' GET route
function handleStatusRoute(req: IncomingMessage, res: ServerResponse) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end('Welcome to Phonio Voice AI Agent.');
}

// Main function to handle all GET routes
export function handleGetRoutes(req: IncomingMessage, res: ServerResponse) {
  switch (req.url) {
    case '/':
      handleStatusRoute(req, res);
      break;

    // Add more GET routes here as needed

    default:
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'GET route not found.' }));
      break;
  }
}
