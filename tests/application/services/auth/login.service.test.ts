import { compare } from 'bcryptjs';
import { AuthService } from '../../../../src/application/services/auth/LoginService';
import { AppDataSource } from '../../../../src/infra/data-source';
import { sign } from 'jsonwebtoken';

jest.mock('../../../../src/infra/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: any;

  beforeEach(() => {
    authService = new AuthService();
    mockUserRepository = {
      findOne: jest.fn(),
    };
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(
      mockUserRepository
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve lançar erro se o e-mail for inválido', async () => {
    const invalidEmail = 'not-an-email';
    await expect(
      authService.execute({ email: invalidEmail, password: 'password123' })
    ).rejects.toThrow('E-mail inválido.');
  });

  it('deve lançar erro se o usuário não for encontrado', async () => {
    mockUserRepository.findOne.mockResolvedValue(null);

    await expect(
      authService.execute({
        email: 'test@example.com',
        password: 'password123',
      })
    ).rejects.toThrow('Email inválido ou usuário não encontrado.');
  });

  it('deve lançar erro se o usuário não tiver senha definida', async () => {
    mockUserRepository.findOne.mockResolvedValue({
      email: 'test@example.com',
      password: null,
    });

    await expect(
      authService.execute({
        email: 'test@example.com',
        password: 'password123',
      })
    ).rejects.toThrow('Email ou senha inválidos.');
  });

  it('deve lançar erro se a senha estiver incorreta', async () => {
    mockUserRepository.findOne.mockResolvedValue({
      email: 'test@example.com',
      password: 'hashedPassword',
    });
    (compare as jest.Mock).mockResolvedValue(false);

    await expect(
      authService.execute({
        email: 'test@example.com',
        password: 'wrongPassword',
      })
    ).rejects.toThrow('Senha incorreta');
  });

  it('deve retornar um token válido se as credenciais estiverem corretas', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
    };
    mockUserRepository.findOne.mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(true);
    (sign as jest.Mock).mockReturnValue('mockToken');

    const result = await authService.execute({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: {
        email: 'test@example.com',
        deletedAt: expect.any(Object),
      },
    });
    expect(compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    expect(sign).toHaveBeenCalledWith(
      { email: mockUser.email },
      expect.any(String),
      { subject: mockUser.id.toString(), expiresIn: '10m' }
    );
    expect(result).toEqual({
      token: 'mockToken',
      message: 'Login realizado com sucesso!',
    });
  });
});
