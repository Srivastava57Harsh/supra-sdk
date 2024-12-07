import { Router } from 'express';
import Logger from '../../loaders/logger';

const route = Router();

export default (app: Router) => {
  app.use('/health', route);

  route.get('/', async (req, res) => {
    try {
      const healthcheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now(),
        env: process.env.NODE_ENV,
        rpcUrl: process.env.SUPRA_RPC_URL || 'https://rpc-testnet.supra.com',
        apiVersion: '1.0.0',
        serverTime: new Date().toISOString(),
      };

      Logger.debug('Health check requested');
      return res.json(healthcheck);
    } catch (error) {
      Logger.error('Health check failed', { error });
      return res.status(503).json({
        message: 'Service Unavailable',
        timestamp: Date.now(),
      });
    }
  });
};
