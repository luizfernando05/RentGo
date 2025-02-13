import { UpdateClientDTO } from '../../../../src/http/dtos/UpdateClient.dto';
import Client from '../../../../src/domain/entities/Client';
import ClientsRepository from '../../../../src/domain/repositories/ClientsRepository';
import UpdateClientService from '../../../../src/application/services/client/UpdateClientService';

jest.mock('../../../../src/domain/repositories/ClientsRepository');

describe('UpdateClientService', () => {
  let updateClientService: UpdateClientService;
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

  const mockUpdateClientDTO: UpdateClientDTO = {
    id: '123',
    name: 'Lalisa Manobal',
    email: 'lisa.updated@example.com',
  };

  beforeEach(() => {
    clientsRepository =
      new ClientsRepository() as jest.Mocked<ClientsRepository>;
    updateClientService = new UpdateClientService();
    (updateClientService as any).clientsRepository = clientsRepository;
  });

  it('deve atualizar um cliente com sucesso', async () => {
    clientsRepository.update.mockResolvedValue({
      ...mockClient,
      ...mockUpdateClientDTO,
      birthday: mockClient.birthday,
    });

    const result = await updateClientService.execute(mockUpdateClientDTO);

    expect(result).toEqual({ ...mockClient, ...mockUpdateClientDTO });
    expect(clientsRepository.update).toHaveBeenCalledWith(mockUpdateClientDTO);
    expect(clientsRepository.update).toHaveBeenCalledTimes(1);
  });

  it('deve retornar null se o cliente não for encontrado', async () => {
    clientsRepository.update.mockResolvedValue(null);

    const result = await updateClientService.execute(mockUpdateClientDTO);

    expect(result).toBeNull();
    expect(clientsRepository.update).toHaveBeenCalledWith(mockUpdateClientDTO);
    expect(clientsRepository.update).toHaveBeenCalledTimes(1);
  });

  it('deve lançar um erro se o repositório lançar uma exceção', async () => {
    clientsRepository.update.mockRejectedValue(
      new Error('Erro ao atualizar cliente')
    );

    await expect(
      updateClientService.execute(mockUpdateClientDTO)
    ).rejects.toThrow('Erro ao atualizar cliente');
    expect(clientsRepository.update).toHaveBeenCalledWith(mockUpdateClientDTO);
    expect(clientsRepository.update).toHaveBeenCalledTimes(1);
  });
});
