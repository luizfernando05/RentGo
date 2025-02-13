import { ListUserService } from '../../../../src/application/services/user/ListUserService';
import { AppDataSource } from '../../../../src/infra/data-source';

jest.mock('../../../../src/infra/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('ListUserService', () => {
  let listUserService: ListUserService;
  let queryBuilderMock: any;

  beforeEach(() => {
    queryBuilderMock = {
      andWhere: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
      withDeleted: jest.fn().mockReturnThis(),
    };

    const mockRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilderMock),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);

    listUserService = new ListUserService();
    jest.clearAllMocks();
  });

  it('deve listar usuários com sucesso', async () => {
    const mockUsers = [
      {
        id: '1',
        full_name: 'Vincenzo Cassano',
        email: 'vincenzo@email.com',
        password: 'hashed_password',
        deletedAt: null,
      },
      {
        id: '2',
        full_name: 'Lalisa Manobal',
        email: 'lisa@email.com',
        password: 'hashed_password',
        deletedAt: null,
      },
    ];

    queryBuilderMock.getManyAndCount.mockResolvedValue([mockUsers, 2]);

    const result = await listUserService.execute({});

    expect(result).toEqual({
      users: [
        {
          id: '1',
          full_name: 'Vincenzo Cassano',
          email: 'vincenzo@email.com',
          deletedAt: null,
        },
        {
          id: '2',
          full_name: 'Lalisa Manobal',
          email: 'lisa@email.com',
          deletedAt: null,
        },
      ],
      total: 2,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });
    expect(queryBuilderMock.getManyAndCount).toHaveBeenCalled();
  });

  it('deve aplicar filtros por nome e email', async () => {
    queryBuilderMock.getManyAndCount.mockResolvedValue([[], 0]);

    await listUserService.execute({
      name: 'John',
      email: 'vincenzo@email.com',
    });

    expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
      'user.full_name LIKE :name',
      { name: '%John%' }
    );
    expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
      'user.email LIKE :email',
      { email: '%vincenzo@email.com%' }
    );
  });

  it('deve aplicar filtro para usuários excluídos', async () => {
    queryBuilderMock.getManyAndCount.mockResolvedValue([[], 0]);

    await listUserService.execute({ isDeleted: true });

    expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
      'user.deletedAt IS NOT NULL'
    );
  });

  it('deve ordenar resultados', async () => {
    queryBuilderMock.getManyAndCount.mockResolvedValue([[], 0]);

    await listUserService.execute({
      orderBy: 'createdAt',
      orderDirection: 'DESC',
    });

    expect(queryBuilderMock.addOrderBy).toHaveBeenCalledWith(
      'user.createdAt',
      'DESC'
    );
  });

  it('deve aplicar paginação', async () => {
    queryBuilderMock.getManyAndCount.mockResolvedValue([[], 0]);

    await listUserService.execute({ page: 2, pageSize: 5 });

    expect(queryBuilderMock.skip).toHaveBeenCalledWith(5);
    expect(queryBuilderMock.take).toHaveBeenCalledWith(5);
  });

  it('deve retornar usuários sem o campo de senha', async () => {
    const mockUsers = [
      {
        id: '1',
        full_name: 'Vincenzo Cassano',
        email: 'vincenzo@email.com',
        password: 'hashed_password',
        deletedAt: null,
      },
    ];
    queryBuilderMock.getManyAndCount.mockResolvedValue([mockUsers, 1]);

    const result = await listUserService.execute({});

    expect(result.users).toEqual([
      {
        id: '1',
        full_name: 'Vincenzo Cassano',
        email: 'vincenzo@email.com',
        deletedAt: null,
      },
    ]);
    expect(result.users[0]).not.toHaveProperty('password');
  });
});
