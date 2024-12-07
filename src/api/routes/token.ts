import { Router } from 'express';
import { createToken, getTokenBalance, transferToken, registerForToken } from '../../services/token_factory_sdk';
import { SupraAccount } from 'supra-l1-sdk';
import Logger from '../../loaders/logger';
import { SUPRA_CONSTANTS } from '../../constants';

const route = Router();

export default (app: Router) => {
  app.use('/tokens', route);

  route.post('/create', async (req, res) => {
    try {
      const { tokenOwnerPrivateKey, name, symbol, tokenType } = req.body;

      if (!tokenOwnerPrivateKey || !name || !symbol || tokenType === undefined) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      // Create token owner account from private key
      const tokenOwnerAccount = new SupraAccount(Buffer.from(tokenOwnerPrivateKey as string, 'hex'));
      const tokenOwnerAddress = tokenOwnerAccount.address().toString();

      // Create deployer account
      const deployerAccount = new SupraAccount(Buffer.from(SUPRA_CONSTANTS.DEPLOYER_PRIVATE_KEY, 'hex'));

      // 1. Create the token
      const createResult = await createToken(
        SUPRA_CONSTANTS.RPC_URL,
        deployerAccount,
        tokenOwnerAddress,
        name,
        symbol,
        tokenType,
      );

      // 2. Register token for token owner
      await registerForToken(SUPRA_CONSTANTS.RPC_URL, tokenOwnerAccount, tokenType);

      // 3. Transfer initial supply to token owner
      await transferToken(
        SUPRA_CONSTANTS.RPC_URL,
        deployerAccount,
        tokenType,
        tokenOwnerAddress,
        10000, // Initial supply
      );

      return res.json({
        ...createResult,
        message: 'Token created, registered and transferred to owner successfully',
      });
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

      // Logger.info('Token registration successful');
      return res.json({ result: true });
    } catch (error) {
      Logger.error('Failed to register for token', { error });
      return res.status(500).json({ error: error.message });
    }
  });

  route.post('/claim', async (req, res) => {
    try {
      const { userPrivateKey, tokenType } = req.body;

      if (!userPrivateKey || tokenType === undefined) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      // Parse tokenType to number
      const parsedTokenType = parseInt(tokenType);
      if (isNaN(parsedTokenType)) {
        return res.status(400).json({ error: 'Invalid token type - must be a number' });
      }

      // Create user account from private key
      const userAccount = new SupraAccount(Buffer.from(userPrivateKey, 'hex'));
      const userAddress = userAccount.address().toString();

      // Create deployer account (who will send the tokens)
      const deployerAccount = new SupraAccount(Buffer.from(SUPRA_CONSTANTS.DEPLOYER_PRIVATE_KEY, 'hex'));

      // 1. Register user for the token
      const registerResult = await registerForToken(SUPRA_CONSTANTS.RPC_URL, userAccount, parsedTokenType);

      // 2. Transfer mock tokens to user
      const MOCK_AMOUNT = 5000; // 0.005 tokens (assuming 6 decimals)
      const transferResult = await transferToken(
        SUPRA_CONSTANTS.RPC_URL,
        deployerAccount,
        parsedTokenType,
        userAddress,
        MOCK_AMOUNT,
      );

      return res.json({
        success: true,
        message: 'Token claimed successfully',
        details: {
          tokenType: parsedTokenType,
          amount: MOCK_AMOUNT,
          recipient: userAddress,
          transactions: {
            register: registerResult.txHash,
            transfer: transferResult.txHash,
          },
        },
      });
    } catch (error) {
      Logger.error('Failed to claim token', { error });
      return res.status(500).json({ error: error.message });
    }
  });
};
