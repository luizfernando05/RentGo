import DeleteClientService from '../../../../src/application/services/client/DeleteClientService';
import ClientsRepository from '../../../../src/domain/repositories/ClientsRepository';
import Client from '../../../../src/domain/entities/Client';

jest.mock('../../../../src/domain/repositories/ClientsRepository');

describe('DeleteClientService', () => {
  let deleteClientService: DeleteClientService;
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
    deleteClientService = new DeleteClientService();
    (deleteClientService as any).clientsRepository = clientsRepository;
  });

  it('deve deletar um cliente com sucesso', async () => {
    clientsRepository.delete.mockResolvedValue(mockClient);

    const result = await deleteClientService.execute('123');

    expect(result).toEqual(mockClient);
    expect(clientsRepository.delete).toHaveBeenCalledWith('123');
    expect(clientsRepository.delete).toHaveBeenCalledTimes(1);
  });

  it('deve retornar null se o cliente não for encontrado', async () => {
    clientsRepository.delete.mockResolvedValue(null);

    const result = await deleteClientService.execute('456');

    expect(result).toBeNull();
    expect(clientsRepository.delete).toHaveBeenCalledWith('456');
    expect(clientsRepository.delete).toHaveBeenCalledTimes(1);
  });

  it('deve lançar um erro se o repositório lançar uma exceção', async () => {
    clientsRepository.delete.mockRejectedValue(
      new Error('Erro ao deletar cliente')
    );

    await expect(deleteClientService.execute('123')).rejects.toThrow(
      'Erro ao deletar cliente'
    );
    expect(clientsRepository.delete).toHaveBeenCalledWith('123');
    expect(clientsRepository.delete).toHaveBeenCalledTimes(1);
  });
});
