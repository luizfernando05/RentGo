import ClientsRepository from '../../../../src/domain/repositories/ClientsRepository';
import ListClientService from '../../../../src/application/services/client/ListClientService';
import { ListClientParams } from '../../../../src/application/params/ListClientParams.type';
import Client from '../../../../src/domain/entities/Client';

jest.mock('../../../../src/domain/repositories/ClientsRepository');

describe('ListClientService', () => {
  let listClientService: ListClientService;
  let clientsRepository: jest.Mocked<ClientsRepository>;

  const mockClient: Client = {
    id: '123',
    name: 'Vincenzo Cassano',
    birthday: new Date('1990-01-01'),
    cpf: '12345678901',
    email: 'vincenzo@email.com',
    phone: '123456789',
    createdAt: new Date(),
    deletedAt: null,
    orders: [],
  };

  const mockClients = [
    mockClient,
    { ...mockClient, id: '124', name: 'Vincenzo Cassano' },
  ];

  const defaultParams: ListClientParams = {
    page: 1,
    pageSize: 10,
    orderBy: 'name',
    orderDirection: 'ASC',
  };

  beforeEach(() => {
    clientsRepository =
      new ClientsRepository() as jest.Mocked<ClientsRepository>;
    listClientService = new ListClientService();
    (listClientService as any).clientsRepository = clientsRepository;
  });

  it('deve retornar uma lista de clientes com sucesso', async () => {
    clientsRepository.index.mockResolvedValue({
      clients: mockClients,
      total: 2,
    });

    const result = await listClientService.execute(defaultParams);

    expect(result).toEqual({
      clients: mockClients,
      total: 2,
      totalPages: 1,
    });
    expect(clientsRepository.index).toHaveBeenCalledWith(defaultParams);
    expect(clientsRepository.index).toHaveBeenCalledTimes(1);
  });

  it('deve retornar uma mensagem quando nenhum cliente for encontrado', async () => {
    clientsRepository.index.mockResolvedValue({
      clients: [],
      total: 0,
    });

    const result = await listClientService.execute(defaultParams);

    expect(result).toEqual({
      message: 'No clients found',
      clients: [],
      total: 0,
      totalPages: 0,
    });
    expect(clientsRepository.index).toHaveBeenCalledWith(defaultParams);
    expect(clientsRepository.index).toHaveBeenCalledTimes(1);
  });

  it('deve calcular corretamente o total de páginas', async () => {
    const pageSize = 3;
    const total = 7;

    clientsRepository.index.mockResolvedValue({
      clients: mockClients,
      total,
    });

    const result = await listClientService.execute({
      ...defaultParams,
      pageSize,
    });

    expect(result).toEqual({
      clients: mockClients,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
    expect(clientsRepository.index).toHaveBeenCalledWith({
      ...defaultParams,
      pageSize,
    });
    expect(clientsRepository.index).toHaveBeenCalledTimes(1);
  });

  it('deve lançar um erro se o repositório lançar uma exceção', async () => {
    clientsRepository.index.mockRejectedValue(
      new Error('Erro ao listar clientes')
    );

    await expect(listClientService.execute(defaultParams)).rejects.toThrow(
      'Erro ao listar clientes'
    );
    expect(clientsRepository.index).toHaveBeenCalledWith(defaultParams);
    expect(clientsRepository.index).toHaveBeenCalledTimes(1);
  });
});
