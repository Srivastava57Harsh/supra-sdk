import { Router } from 'express';
import token from './routes/token';
import init from './routes/init';

export default (): Router => {
  const app = Router();
  init(app);
  token(app);
  return app;
};
