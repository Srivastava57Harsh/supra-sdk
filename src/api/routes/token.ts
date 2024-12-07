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

      // Log RPC URL
      Logger.debug('Using RPC URL', { url: process.env.SUPRA_RPC_URL });

      if (!process.env.SUPRA_RPC_URL) {
        throw new Error('SUPRA_RPC_URL not configured');
      }

      Logger.debug('Creating SupraAccount', { privateKeyLength: privateKey?.length });
      const creator = new SupraAccount(Buffer.from(privateKey, 'hex'));

      // Log account details
      Logger.debug('Account created', {
        address: creator.address?.toString(),
        //@ts-ignore
        hasPublicKey: !!creator.publicKey,
        //@ts-ignore
        publicKeyType: typeof creator.publicKey,
      });

      const result = await createToken(process.env.SUPRA_RPC_URL, creator, name, symbol, initialSupply);

      return res.json(result);
    } catch (e) {
      Logger.error('Token creation failed', {
        error: e.message,
        stack: e.stack,
        rpcUrl: process.env.SUPRA_RPC_URL,
      });
      return res.status(500).json({
        error: e.message,
        details: process.env.NODE_ENV === 'development' ? e.stack : undefined,
      });
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
