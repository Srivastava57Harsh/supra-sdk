import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import config from '../config';
import routes from '../api';
import Logger from './logger';

export default ({ app }: { app: express.Application }): void => {
  app.use((req, res, next) => {
    Logger.debug('Incoming request', {
      method: req.method,
      path: req.path,
      body: req.body,
      query: req.query
    });
    next();
  });

  app.use(bodyParser.json({
    verify: (req, res, buf) => {
      try {
        JSON.parse(buf.toString());
      } catch (e) {
        Logger.error('Invalid JSON', { error: e.message, body: buf.toString() });
        throw new Error('Invalid JSON');
      }
    }
  }));

  /**
   * Health Check endpoints
   */

  app.get('/healthcheck', (req, res) => {
    const healthcheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now(),
    };
    try {
      return res.json(healthcheck);
    } catch (e) {
      return res.status(503).send();
    }
  });

  // It shows the real origin IP in the heroku or Cloudwatch logs
  app.enable('trust proxy');

  // Middleware that helps secure app by setting headers
  app.use(helmet());

  // Enable Cross Origin Resource Sharing to all origins by default
  app.use(cors());

  // Load API routes
  app.use(config.api.prefix, routes());
};
