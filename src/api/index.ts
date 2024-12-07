import { Router } from 'express';
import token from './routes/token';
import init from './routes/init';
import health from './routes/health';

export default (): Router => {
  const app = Router();
  health(app);
  init(app);
  token(app);
  return app;
};
