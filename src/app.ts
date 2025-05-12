// src/index.ts

import { startAgent } from './agent';
import { startServer } from './server';

async function main() {
  startServer(); // Start the server
  await startAgent(); // Start the agent
}

main().catch((error) => {
  console.error('Error starting application:', error);
});
