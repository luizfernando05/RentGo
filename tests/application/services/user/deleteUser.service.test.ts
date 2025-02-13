import { DeleteUserService } from '../../../../src/application/services/user/DeleteUserService';
import { AppDataSource } from '../../../../src/infra/data-source';

jest.mock('../../../../src/infra/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('DeleteUserService', () => {
  let deleteUserService: DeleteUserService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findOne: jest.fn(),
      softDelete: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);

    deleteUserService = new DeleteUserService();
    jest.clearAllMocks();
  });

  it('deve excluir um usuário com sucesso', async () => {
    const mockUser = {
      id: '123',
      full_name: 'Vincenzo Cassano',
      email: 'vincenzo@email.com',
      deletedAt: null,
    };

    mockRepository.findOne.mockResolvedValue(mockUser);

    const result = await deleteUserService.execute({ id: '123' });

    expect(result).toEqual({ message: 'Usuário excluído com sucesso!' });
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: '123' },
      withDeleted: true,
    });
    expect(mockRepository.softDelete).toHaveBeenCalledWith('123');
  });

  it('deve lançar erro se o usuário já foi excluído', async () => {
    const mockUser = {
      id: '123',
      full_name: 'Vincenzo Cassano',
      email: 'vincenzo@email.com',
      deletedAt: new Date(),
    };

    mockRepository.findOne.mockResolvedValue(mockUser);

    await expect(deleteUserService.execute({ id: '123' })).rejects.toThrow(
      'Usuário já foi excluído'
    );

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: '123' },
      withDeleted: true,
    });
    expect(mockRepository.softDelete).not.toHaveBeenCalled();
  });

  it('deve lançar erro se o ID do usuário não for encontrado', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(
      deleteUserService.execute({ id: 'invalid-id' })
    ).rejects.toThrow('ID do Usuário não encontrado');

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'invalid-id' },
      withDeleted: true,
    });
    expect(mockRepository.softDelete).not.toHaveBeenCalled();
  });
});
