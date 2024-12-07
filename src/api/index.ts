import { Router } from 'express';
import token from './routes/token';

export default (): Router => {
  const app = Router();
  token(app);
  return app;
};
