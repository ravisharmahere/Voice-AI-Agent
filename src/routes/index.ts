// routes/index.ts

import { IncomingMessage, ServerResponse } from 'http';
import { handlePostRoutes } from './postRoutes';
import { handleGetRoutes } from './getRoutes';

export function routeManager(req: IncomingMessage, res: ServerResponse) {
  const method = req.method || '';

  switch (method) {
    case 'POST':
      handlePostRoutes(req, res);
      break;

    case 'GET':
      handleGetRoutes(req, res);
      break;

    default:
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed.' }));
      break;
  }
}
