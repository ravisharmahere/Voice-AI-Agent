// server.ts
import dotenv from 'dotenv';
import http from 'http';
import { routeManager } from './routes';

// Load environment variables from .env file
dotenv.config();

const { SERVER_PORT } = process.env;

export function startServer() {
  const server = http.createServer((req, res) => {
    routeManager(req, res);
  });

  server.listen(SERVER_PORT, () => {
    console.log(`Server is running on port ${SERVER_PORT}`);
  });
}
