import { Router } from 'express';
import { createToken, getTokenBalance, transferToken, registerForToken } from '../../services/token_factory_sdk';
import { SupraAccount } from 'supra-l1-sdk';
import Logger from '../../loaders/logger';

const route = Router();

export default (app: Router) => {
  app.use('/tokens', route);

  route.post('/create', async (req, res) => {
    try {
      const { privateKey, tokenOwner, name, symbol, initialSupply } = req.body;

      if (!privateKey || !tokenOwner || !name || !symbol || !initialSupply) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const creator = new SupraAccount(Buffer.from(privateKey, 'hex'));
      const result = await createToken(
        process.env.SUPRA_RPC_URL || 'https://rpc-testnet.supra.com',
        creator,
        tokenOwner,
        name,
        symbol,
        initialSupply,
      );

      Logger.info('Token created successfully', { name, symbol });
      return res.json(result);
    } catch (error) {
      Logger.error('Failed to create token', { error });
      return res.status(500).json({ error: error.message });
    }
  });

  route.get('/balance/:tokenType/:address', async (req, res) => {
    try {
      const { tokenType, address } = req.params;

      const balance = await getTokenBalance(
        process.env.SUPRA_RPC_URL || 'https://rpc-testnet.supra.com',
        parseInt(tokenType),
        address,
      );

      return res.json(balance);
    } catch (error) {
      Logger.error('Failed to get balance', { error });
      return res.status(500).json({ error: error.message });
    }
  });

  route.post('/transfer', async (req, res) => {
    try {
      const { privateKey, tokenType, recipient, amount } = req.body;

      if (!privateKey || tokenType === undefined || !recipient || !amount) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const sender = new SupraAccount(Buffer.from(privateKey, 'hex'));
      const result = await transferToken(
        process.env.SUPRA_RPC_URL || 'https://rpc-testnet.supra.com',
        sender,
        tokenType,
        recipient,
        amount,
      );

      Logger.info('Token transferred successfully');
      return res.json(result);
    } catch (error) {
      Logger.error('Failed to transfer token', { error });
      return res.status(500).json({ error: error.message });
    }
  });

  route.get('/register/:tokenType', async (req, res) => {
    try {
      const { tokenType } = req.params;
      const { privateKey } = req.query;

      if (!privateKey || tokenType === undefined) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const account = new SupraAccount(Buffer.from(privateKey as string, 'hex'));
      const result = await registerForToken(
        process.env.SUPRA_RPC_URL || 'https://rpc-testnet.supra.com',
        account,
        parseInt(tokenType),
      );

      Logger.info('Token registration successful');
      return res.json(result);
    } catch (error) {
      Logger.error('Failed to register for token', { error });
      return res.status(500).json({ error: error.message });
    }
  });
};
