import { IsNull } from 'typeorm';
import { CreateUserService } from '../../../../src/application/services/user/CreateUseService';
import { usersRepository } from '../../../../src/domain/repositories/UserRepository';
import { hash } from 'bcryptjs';

jest.mock('../../../../src/domain/repositories/UserRepository');
jest.mock('bcryptjs');

describe('CreateUserService', () => {
  let createUserService: CreateUserService;

  beforeEach(() => {
    createUserService = new CreateUserService();
    jest.clearAllMocks();
  });

  it('deve criar um usuário com sucesso', async () => {
    const mockUser = {
      id: '123',
      full_name: 'Vincenzo Cassano',
      email: 'vincenzo@email.com',
      password: 'hashed_password',
      createdAt: new Date(),
      deletedAt: null,
    };

    (usersRepository.findOne as jest.Mock).mockResolvedValue(null);
    (hash as jest.Mock).mockResolvedValue('hashed_password');
    (usersRepository.create as jest.Mock).mockReturnValue(mockUser);
    (usersRepository.save as jest.Mock).mockResolvedValue(mockUser);

    const user = await createUserService.execute({
      full_name: 'Vincenzo Cassano',
      email: 'vincenzo@email.com',
      password: 'password123',
    });

    expect(usersRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'vincenzo@email.com', deletedAt: IsNull() },
    });
    expect(hash).toHaveBeenCalledWith('password123', 8);
    expect(usersRepository.save).toHaveBeenCalledWith(mockUser);
    expect(user).toEqual({
      id: '123',
      full_name: 'Vincenzo Cassano',
      email: 'vincenzo@email.com',
      createdAt: mockUser.createdAt,
    });
  });

  it('deve falhar ao criar usuário com e-mail inválido', async () => {
    await expect(
      createUserService.execute({
        full_name: 'Vincezo Cassano',
        email: 'ivalid_email',
        password: 'password123',
      })
    ).rejects.toThrow('E-mail inválido.');
  });

  it('deve falhar se algum campo obrigatório estiver vazio', async () => {
    await expect(
      createUserService.execute({
        full_name: '',
        email: 'vincenzo@email.com',
        password: 'password123',
      })
    ).rejects.toThrow('Campo vazio: nome completo');

    await expect(
      createUserService.execute({
        full_name: 'Vincenzo Cassano',
        email: '',
        password: 'password123',
      })
    ).rejects.toThrow('Campo vazio: email');

    await expect(
      createUserService.execute({
        full_name: 'Vincenzo Cassano',
        email: 'vincenzo@email.com',
        password: '',
      })
    ).rejects.toThrow('Campo vazio: senha');
  });

  it('deve falhar se o usuário já existir', async () => {
    const existingUser = {
      id: '123',
      full_name: 'Vincenzo Cassano',
      email: 'vincenzo@email.com',
      password: 'hashed_password',
      createdAt: new Date(),
      deletedAt: null,
    };

    (usersRepository.findOne as jest.Mock).mockResolvedValue(existingUser);

    await expect(
      createUserService.execute({
        full_name: 'Vincenzo Cassano',
        email: 'vincenzo@email.com',
        password: 'hashed_password',
      })
    ).rejects.toThrow('Usuário já existe');
  });

  it('deve hashizar a senha corretamente', async () => {
    (usersRepository.findOne as jest.Mock).mockResolvedValue(null);
    (hash as jest.Mock).mockResolvedValue('hashed_password');
    (usersRepository.create as jest.Mock).mockReturnValue({
      id: '123',
      full_name: 'Vincenzo Cassano',
      email: 'vincenzo@email.com',
      password: 'hashed_password',
      createdAt: new Date(),
      deletedAt: null,
    });

    await createUserService.execute({
      full_name: 'Vincenzo Cassano',
      email: 'vincenzo@email.com',
      password: 'password123',
    });

    expect(hash).toHaveBeenCalledWith('password123', 8);
  });
});
