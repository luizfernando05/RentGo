import { UpdateUserService } from '../../../../src/application/services/user/UpdateUserService';
import { AppDataSource } from '../../../../src/infra/data-source';
import { hash, compare } from 'bcryptjs';
import { IsNull } from 'typeorm';

jest.mock('../../../../src/infra/data-source');
jest.mock('bcryptjs');

const userRepositoryMock = {
  findOne: jest.fn(),
  save: jest.fn(),
};

(AppDataSource.getRepository as jest.Mock).mockReturnValue(userRepositoryMock);

describe('UpdateUserService', () => {
  let updateUserService: UpdateUserService;

  beforeEach(() => {
    updateUserService = new UpdateUserService();
    jest.clearAllMocks();
  });

  it('deve atualizar um usuário com sucesso', async () => {
    const mockUser = {
      id: '123',
      full_name: 'Vincenzo Cassano',
      email: 'vincenzo@email.com',
      password: 'hashed_password',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    userRepositoryMock.findOne
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(null);

    (compare as jest.Mock).mockResolvedValue(true);
    (hash as jest.Mock).mockResolvedValue('new_hashed_password');

    const result = await updateUserService.execute({
      id: '123',
      full_name: 'John Updated',
      email: 'john.updated@example.com',
      password: 'current_password',
      newPassword: 'new_password',
    });

    expect(userRepositoryMock.findOne).toHaveBeenNthCalledWith(1, {
      where: { id: '123' },
    });
    expect(userRepositoryMock.findOne).toHaveBeenNthCalledWith(2, {
      where: { email: 'john.updated@example.com', deletedAt: IsNull() },
    });
    expect(compare).toHaveBeenCalledWith('current_password', 'hashed_password');
    expect(hash).toHaveBeenCalledWith('new_password', 8);

    expect(userRepositoryMock.save).toHaveBeenCalledWith({
      ...mockUser,
      full_name: 'John Updated',
      email: 'john.updated@example.com',
      password: 'new_hashed_password',
      updatedAt: expect.any(Date),
    });

    expect(result).toEqual({
      message: 'Registro atualizado com sucesso',
    });
  });

  it('deve lançar erro se o ID não for preenchido', async () => {
    await expect(
      updateUserService.execute({
        id: '',
        full_name: 'Vincenzo Cassano',
        email: 'vincenzo@email.com',
        password: 'password123',
        newPassword: 'new_password',
      })
    ).rejects.toThrow('ID não preenchido');
  });

  it('deve lançar erro se a senha atual não for preenchida', async () => {
    await expect(
      updateUserService.execute({
        id: '123',
        full_name: 'Vincenzo Cassano',
        email: 'vincenzo@email.com',
        password: '',
        newPassword: 'new_password',
      })
    ).rejects.toThrow('Senha atual não preenchida');
  });

  it('deve lançar erro se o usuário não existir', async () => {
    userRepositoryMock.findOne.mockResolvedValue(null);

    await expect(
      updateUserService.execute({
        id: '123',
        full_name: 'Vincenzo Cassano',
        email: 'vincenzo@email.com',
        password: 'password123',
        newPassword: 'new_password',
      })
    ).rejects.toThrow('Usuário não existe');
  });

  it('deve lançar erro se o email já estiver em uso', async () => {
    const mockUser = { id: '123', email: 'vincenzo@email.com' };

    userRepositoryMock.findOne
      .mockResolvedValueOnce(mockUser)
      .mockResolvedValueOnce(mockUser);

    await expect(
      updateUserService.execute({
        id: '123',
        full_name: 'Vincenzo Cassano',
        email: 'existing.email@example.com',
        password: 'password123',
        newPassword: 'new_password',
      })
    ).rejects.toThrow('Email já está em uso');
  });

  it('deve lançar erro se a senha atual estiver incorreta', async () => {
    const mockUser = {
      id: '123',
      full_name: 'Vincenzo Cassano',
      email: 'vincenzo@email.com',
      password: 'hashed_password',
    };

    userRepositoryMock.findOne.mockResolvedValue(mockUser);
    (compare as jest.Mock).mockResolvedValue(false);

    await expect(
      updateUserService.execute({
        id: '123',
        full_name: 'Vincenzo Cassano',
        email: 'vincenzo@email.com',
        password: 'wrong_password',
        newPassword: 'new_password',
      })
    ).rejects.toThrow('Senha atual incorreta');
  });
});
