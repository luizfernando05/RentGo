import dotenv from 'dotenv';
import { randomBytes } from 'crypto';
dotenv.config();

export const JWT_SECRET =
  process.env.JWT_SECRET || randomBytes(32).toString('hex');
