// src/index.ts

import { startAgent } from './agent';
import { createSipDispatchRule } from './dispatchRule';
import { startServer } from './server';

async function main() {
  startServer(); // Start the server
  await startAgent(); // Start the agent
  await createSipDispatchRule();
}

main().catch((error) => {
  console.error('Error starting application:', error);
});
