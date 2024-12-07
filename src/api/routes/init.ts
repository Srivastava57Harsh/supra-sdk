import { Router } from 'express';
import { SupraAccount, SupraClient } from 'supra-l1-sdk';
import { initializeContract } from '../../services/initialize';
import Logger from '../../loaders/logger';

const route = Router();

export default (app: Router) => {
  app.use('/init', route);

  route.post('/', async (req, res) => {
    try {
      const { privateKey } = req.body;

      if (!privateKey) {
        return res.status(400).json({ error: 'Missing private key' });
      }

      const adminAccount = new SupraAccount(Buffer.from(privateKey, 'hex'));
      const supraClient = await SupraClient.init(process.env.SUPRA_RPC_URL || 'https://rpc-testnet.supra.com/');

      const result = await initializeContract(supraClient, adminAccount);

      Logger.info('Contract initialized successfully');
      return res.json(result);
    } catch (error) {
      Logger.error('Failed to initialize contract', { error });
      return res.status(500).json({ error: error.message });
    }
  });
};
