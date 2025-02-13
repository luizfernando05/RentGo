import { AppDataSource } from '../../../infra/data-source';
import User from '../../../domain/entities/User';

interface IUserById {
  id: string;
}

export class SelectUserByIdService {
  async execute({ id }: IUserById) {
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }
}
