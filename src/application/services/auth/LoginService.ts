import { compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { AppDataSource } from '../../../infra/data-source';
import User from '../../../domain/entities/User';
import { IsNull } from 'typeorm';
import { JWT_SECRET } from '../../../infra/config/auth';
import { emailRegex } from '../../../infra/config/regex';

interface IAuthRequest {
  email: string;
  password: string;
}

export class AuthService {
  async execute({ email, password }: IAuthRequest) {
    if (!emailRegex.test(email)) {
      throw new Error('E-mail inválido.');
    }

    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: {
        email,
        deletedAt: IsNull(),
      },
    });

    if (!user) {
      throw new Error('Email inválido ou usuário não encontrado.');
    }

    if (!user.password) {
      throw new Error('Email ou senha inválidos.');
    }

    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      throw new Error('Senha incorreta');
    }

    const token = sign({ email: user.email }, JWT_SECRET, {
      subject: user.id!.toString(),
      expiresIn: '10m',
    });

    return { token, message: 'Login realizado com sucesso!' };
  }
}
