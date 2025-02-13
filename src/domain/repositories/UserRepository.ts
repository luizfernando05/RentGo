import { Repository } from 'typeorm';
import { User } from '../entities/User';
import { AppDataSource } from '../../infra/data-source';

const usersRepository = AppDataSource.getRepository(User);

export { usersRepository };
