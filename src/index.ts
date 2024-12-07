import express from 'express';

import config from './config';
import Loaders from './loaders';
import Logger from './loaders/logger';
import { SupraAccount, SupraClient } from 'supra-l1-sdk';
import { initializeContract } from './services/initialize';

async function startServer() {
  const app = express();

  await Loaders({ expressApp: app });

  app
    .listen(config.port, () => {
      Logger.info(`
      ################################################
      🛡️  Server listening on port: ${config.port} 🛡️
      ################################################
    `);
    })
    .on('error', err => {
      Logger.error(err);
      process.exit(1);
    });
}

async function initializeApplication() {
  try {
    // Initialize with more explicit options
    const supraClient = await SupraClient.init('https://rpc-testnet.supra.com/');

    // Wait for client to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    const adminAccount = new SupraAccount(
      Buffer.from('335faef3a35932c83b5a2f7cff5edee7a9ff38bcb5c1ad6dc176e43ebd9af471', 'hex'),
    );

    await initializeContract(supraClient, adminAccount);
    await startServer();
  } catch (error) {
    Logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

initializeApplication();
