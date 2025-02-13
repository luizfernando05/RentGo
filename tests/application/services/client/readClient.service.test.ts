import ReadClientService from '../../../../src/application/services/client/ReadClientService';
import ClientsRepository from '../../../../src/domain/repositories/ClientsRepository';
import Client from '../../../../src/domain/entities/Client';

jest.mock('../../../../src/domain/repositories/ClientsRepository');

describe('ReadClientService', () => {
  let readClientService: ReadClientService;
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

  beforeEach(() => {
    clientsRepository =
      new ClientsRepository() as jest.Mocked<ClientsRepository>;
    readClientService = new ReadClientService();
    (readClientService as any).clientsRepository = clientsRepository;
  });

  it('deve retornar um cliente pelo ID com sucesso', async () => {
    clientsRepository.findById.mockResolvedValue(mockClient);

    const result = await readClientService.execute('123');

    expect(result).toEqual(mockClient);
    expect(clientsRepository.findById).toHaveBeenCalledWith('123');
    expect(clientsRepository.findById).toHaveBeenCalledTimes(1);
  });

  it('deve retornar null se o cliente não for encontrado', async () => {
    clientsRepository.findById.mockResolvedValue(null);

    const result = await readClientService.execute('456');

    expect(result).toBeNull();
    expect(clientsRepository.findById).toHaveBeenCalledWith('456');
    expect(clientsRepository.findById).toHaveBeenCalledTimes(1);
  });

  it('deve lançar um erro se o repositório lançar uma exceção', async () => {
    clientsRepository.findById.mockRejectedValue(
      new Error('Erro ao buscar cliente')
    );

    await expect(readClientService.execute('123')).rejects.toThrow(
      'Erro ao buscar cliente'
    );
    expect(clientsRepository.findById).toHaveBeenCalledWith('123');
    expect(clientsRepository.findById).toHaveBeenCalledTimes(1);
  });
});
