import { compare, hash } from 'bcryptjs';
import { UpdateUserDto } from '../../../http/dtos/UpdateUser.dto';
import { AppDataSource } from '../../../infra/data-source';
import User from '../../../domain/entities/User';
import { IsNull } from 'typeorm';

export class UpdateUserService {
  async execute({
    id,
    full_name,
    email,
    password,
    newPassword,
  }: UpdateUserDto) {
    if (!id) throw new Error('ID não preenchido');
    if (!password) throw new Error('Senha atual não preenchida');

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({ where: { id } });
    if (!user) throw new Error('Usuário não existe');

    if (email && email !== user.email) {
      const existingUser = await userRepository.findOne({
        where: { email, deletedAt: IsNull() },
      });
      if (existingUser) throw new Error('Email já está em uso');
    }

    if (!user.password || !(await compare(password, user.password))) {
      throw new Error('Senha atual incorreta');
    }

    if (user.deletedAt !== null) {
      throw new Error('Não é possível atualizar um usuário excluído');
    }

    const updatedPassword = newPassword
      ? await hash(newPassword, 8)
      : user.password;

    user.full_name = full_name || user.full_name;
    user.email = email || user.email;
    user.password = updatedPassword;
    user.updatedAt = new Date();

    await userRepository.save(user);

    return {
      message: 'Registro atualizado com sucesso',
    };
  }
}
