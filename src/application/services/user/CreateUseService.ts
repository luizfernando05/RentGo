import { hash } from 'bcryptjs';
import { usersRepository } from '../../../domain/repositories/UserRepository';
import { IsNull } from 'typeorm';
import { CreateUserDto } from '../../../http/dtos/CreateUser.dto';
import { emailRegex } from '../../../infra/config/regex';

class CreateUserService {
  async execute({ full_name, email, password }: CreateUserDto) {
    if (!email) throw new Error('Campo vazio: email');
    if (!emailRegex.test(email)) {
      throw new Error('E-mail inválido.');
    }

    if (!full_name) throw new Error('Campo vazio: nome completo');
    if (!password) throw new Error('Campo vazio: senha');

    const existingUser = await usersRepository.findOne({
      where: { email, deletedAt: IsNull() },
    });
    if (existingUser) throw new Error('Usuário já existe');

    const passwordHash = await hash(password, 8);

    const newUser = usersRepository.create({
      full_name,
      email,
      password: passwordHash,
      createdAt: new Date(),
      deletedAt: null,
    });

    await usersRepository.save(newUser);

    const { password: _, deletedAt: __, ...sanitizedUser } = newUser;
    return sanitizedUser;
  }
}

export { CreateUserService };
