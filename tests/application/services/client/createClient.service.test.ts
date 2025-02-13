import { CreateClientDTO } from '../../../../src/http/dtos/CreateClient.dto';
import Client from '../../../../src/domain/entities/Client';
import ClientsRepository from '../../../../src/domain/repositories/ClientsRepository';
import CreateClientService from '../../../../src/application/services/client/CreateClientService';

jest.mock('../../../../src/domain/repositories/ClientsRepository');

describe('CreateClientService', () => {
  let createClientService: CreateClientService;
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

  const mockCreateClientDTO: CreateClientDTO = {
    id: '123',
    name: 'Vincenzo Cassano',
    birthday: '1990-01-01',
    cpf: '12345678901',
    email: 'vincenzo@email.com',
    phone: '123456789',
  };

  beforeEach(() => {
    clientsRepository =
      new ClientsRepository() as jest.Mocked<ClientsRepository>;
    createClientService = new CreateClientService();
    (createClientService as any).clientsRepository = clientsRepository;
  });

  it('deve criar um cliente com sucesso', async () => {
    clientsRepository.create.mockResolvedValue(mockClient);

    const result = await createClientService.execute(mockCreateClientDTO);

    expect(result).toEqual(mockClient);
    expect(clientsRepository.create).toHaveBeenCalledWith(mockCreateClientDTO);
    expect(clientsRepository.create).toHaveBeenCalledTimes(1);
  });

  it('deve retornar null se o repositório não conseguir criar o cliente', async () => {
    clientsRepository.create.mockResolvedValue(null);

    const result = await createClientService.execute(mockCreateClientDTO);

    expect(result).toBeNull();
    expect(clientsRepository.create).toHaveBeenCalledWith(mockCreateClientDTO);
    expect(clientsRepository.create).toHaveBeenCalledTimes(1);
  });

  it('deve lançar um erro se o repositório lançar uma exceção', async () => {
    clientsRepository.create.mockRejectedValue(
      new Error('Erro ao criar cliente')
    );

    await expect(
      createClientService.execute(mockCreateClientDTO)
    ).rejects.toThrow('Erro ao criar cliente');
    expect(clientsRepository.create).toHaveBeenCalledWith(mockCreateClientDTO);
    expect(clientsRepository.create).toHaveBeenCalledTimes(1);
  });
});
