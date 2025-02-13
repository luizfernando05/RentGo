import { SelectUserByIdService } from '../../../../src/application/services/user/SelectUserByIdService';
import { AppDataSource } from '../../../../src/infra/data-source';

jest.mock('../../../../src/infra/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('SelectUserByIdService', () => {
  let selectUserByIdService: SelectUserByIdService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findOne: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);

    selectUserByIdService = new SelectUserByIdService();
    jest.clearAllMocks();
  });

  it('deve retornar um usuário pelo ID', async () => {
    const mockUser = {
      id: '123',
      full_name: 'Vincenzo Cassano',
      email: 'vincenzo@email.com',
      password: 'hashed_password',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    mockRepository.findOne.mockResolvedValue(mockUser);

    const result = await selectUserByIdService.execute({ id: '123' });

    expect(result).toEqual(mockUser);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: '123' },
      withDeleted: true,
    });
  });

  it('deve lançar erro se o usuário não for encontrado', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(
      selectUserByIdService.execute({ id: 'invalid-id' })
    ).rejects.toThrow('Usuário não encontrado');

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'invalid-id' },
      withDeleted: true,
    });
  });

  it('deve retornar usuários excluídos se `withDeleted` for aplicado', async () => {
    const mockUser = {
      id: '123',
      full_name: 'Deleted User',
      email: 'deleted.user@example.com',
      password: 'hashed_password',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
    };

    mockRepository.findOne.mockResolvedValue(mockUser);

    const result = await selectUserByIdService.execute({ id: '123' });

    expect(result).toEqual(mockUser);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: '123' },
      withDeleted: true,
    });
  });
});
