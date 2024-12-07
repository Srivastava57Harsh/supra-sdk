import { Router } from 'express';
import { SupraAccount } from 'supra-l1-sdk';
import { createToken, registerForToken, transferTokens } from '../../services/token_factory_sdk';
import Logger from '../../loaders/logger';

const route = Router();

export default (app: Router) => {
  app.use('/tokens', route);

  route.post('/create', async (req, res) => {
    Logger.info('Received create token request', { body: req.body });
    try {
      const { privateKey, name, symbol, initialSupply } = req.body;
      Logger.debug('Creating SupraAccount', { privateKeyLength: privateKey?.length });
      
      const creator = new SupraAccount(Buffer.from(privateKey, 'hex'));
      Logger.debug('SupraAccount created', { 
        address: creator.address?.toString(),
        //@ts-ignore
        publicKey: creator.publicKey?.toString()
      });

      const result = await createToken(
        process.env.SUPRA_RPC_URL,
        creator,
        name,
        symbol,
        initialSupply
      );
      Logger.info('Token created successfully', { result });
      return res.json(result);
    } catch (e) {
      Logger.error('Token creation failed', { error: e.message, stack: e.stack });
      return res.status(500).json({ error: e.message });
    }
  });

  route.post('/register', async (req, res) => {
    try {
      const { privateKey, tokenNumber } = req.body;
      const recipient = new SupraAccount(Buffer.from(privateKey, 'hex'));
      const result = await registerForToken(process.env.SUPRA_RPC_URL, recipient, tokenNumber);
      return res.json(result);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });

  route.post('/transfer', async (req, res) => {
    try {
      const { fromPrivateKey, toAddress, amount, tokenNumber } = req.body;
      const from = new SupraAccount(Buffer.from(fromPrivateKey, 'hex'));
      const result = await transferTokens(process.env.SUPRA_RPC_URL, from, toAddress, amount, tokenNumber);
      return res.json(result);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
};
