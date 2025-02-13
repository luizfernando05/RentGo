import { AppDataSource } from '../../../infra/data-source';
import User from '../../../domain/entities/User';

interface IUserDelete {
  id: string;
}

export class DeleteUserService {
  async execute({ id }: IUserDelete) {
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!user) throw new Error('ID do Usuário não encontrado');

    if (user.deletedAt) {
      throw new Error('Usuário já foi excluído');
    }

    await userRepository.softDelete(id);

    return { message: 'Usuário excluído com sucesso!' };
  }
}
