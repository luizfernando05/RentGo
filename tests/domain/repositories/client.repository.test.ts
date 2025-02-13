import { Repository } from 'typeorm';
import ClientsRepository from '../../../src/domain/repositories/ClientsRepository';
import { AppDataSource } from '../../../src/infra/data-source';
import { Client } from '../../../src/domain/entities/Client';

jest.mock('../../../src/infra/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('ClientsRepository', () => {
  let clientsRepository: ClientsRepository;
  let clientRepositoryMock: jest.Mocked<Repository<Client>>;

  beforeEach(() => {
    clientRepositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<Client>>;

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(
      clientRepositoryMock
    );
    clientsRepository = new ClientsRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar e salvar um novo cliente', async () => {
      const clientData = {
        id: '123',
        name: 'Vincenzo Cassano',
        birthday: '1990-01-01',
        cpf: '123.456.789-00',
        email: 'vincenzo@email.com',
        phone: '123456789',
      };

      const client = new Client();
      clientRepositoryMock.findOne.mockResolvedValue(null);
      clientRepositoryMock.create.mockReturnValue(client);
      clientRepositoryMock.save.mockResolvedValue(client);

      const result = await clientsRepository.create(clientData);

      expect(clientRepositoryMock.findOne).toHaveBeenCalledWith({
        where: [
          { email: clientData.email },
          { cpf: clientData.cpf.replace(/\D/g, '') },
        ],
        withDeleted: true,
      });
      expect(clientRepositoryMock.create).toHaveBeenCalledWith({
        ...clientData,
        cpf: clientData.cpf.replace(/\D/g, ''),
      });
      expect(clientRepositoryMock.save).toHaveBeenCalledWith(client);
      expect(result).toBe(client);
    });

    it('deve retornar null se um cliente já existir', async () => {
      const existingClient = new Client();
      clientRepositoryMock.findOne.mockResolvedValue(existingClient);

      const result = await clientsRepository.create({
        id: '123',
        name: 'Vincezo Cassano',
        birthday: '1990-01-01',
        cpf: '123.456.789-00',
        email: 'vincenzo@email.com',
        phone: '123456789',
      });

      expect(result).toBeNull();
      expect(clientRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('deve retornar um cliente pelo id', async () => {
      const client = new Client();
      client.id = '1';

      clientRepositoryMock.findOneBy.mockResolvedValue(client);

      const result = await clientsRepository.findById('1');

      expect(clientRepositoryMock.findOneBy).toHaveBeenCalledWith({ id: '1' });
      expect(result).toBe(client);
    });

    it('deve retornar null se um cliente não existir', async () => {
      clientRepositoryMock.findOneBy.mockResolvedValue(null);

      const result = await clientsRepository.findById('non-existing-id');

      expect(result).toBeNull();
    });
  });

  describe('index', () => {
    it('deve retornar todos os clientes com paginação e filtros', async () => {
      const clients = [new Client(), new Client()];
      const total = 2;

      const queryBuilderMock = {
        andWhere: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([clients, total]),
      };

      clientRepositoryMock.createQueryBuilder.mockReturnValue(
        queryBuilderMock as any
      );

      const params = { page: 1, pageSize: 10, name: 'Vincenzo Cassano' };
      const result = await clientsRepository.index(params);

      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'client.name = :name',
        {
          name: params.name,
        }
      );
      expect(result.clients).toEqual(clients);
      expect(result.total).toBe(total);
    });

    it('deve filtrar por name', async () => {
      const queryBuilderMock = {
        andWhere: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      clientRepositoryMock.createQueryBuilder.mockReturnValue(
        queryBuilderMock as any
      );

      await clientsRepository.index({ name: 'Vincenzo Cassano' });

      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'client.name = :name',
        { name: 'Vincenzo Cassano' }
      );
    });

    it('deve filtrar por email', async () => {
      const queryBuilderMock = {
        andWhere: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      clientRepositoryMock.createQueryBuilder.mockReturnValue(
        queryBuilderMock as any
      );

      await clientsRepository.index({ email: 'vincenzo@email.com' });

      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'client.email = :email',
        { email: 'vincenzo@email.com' }
      );
    });

    it('deve filtrar por cpf', async () => {
      const queryBuilderMock = {
        andWhere: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      clientRepositoryMock.createQueryBuilder.mockReturnValue(
        queryBuilderMock as any
      );

      await clientsRepository.index({ cpf: '12345678900' });

      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'client.cpf = :cpf',
        { cpf: '12345678900' }
      );
    });

    it('deve ordenar os resultados pelo campo escolhido', async () => {
      const queryBuilderMock = {
        addOrderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      clientRepositoryMock.createQueryBuilder.mockReturnValue(
        queryBuilderMock as any
      );

      await clientsRepository.index({
        orderBy: 'name',
        orderDirection: 'DESC',
      });

      expect(queryBuilderMock.addOrderBy).toHaveBeenCalledWith(
        'client.name',
        'DESC'
      );
    });

    it('deve lidar com paginação', async () => {
      const queryBuilderMock = {
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      clientRepositoryMock.createQueryBuilder.mockReturnValue(
        queryBuilderMock as any
      );

      await clientsRepository.index({ page: 2, pageSize: 5 });

      expect(queryBuilderMock.skip).toHaveBeenCalledWith(5);
      expect(queryBuilderMock.take).toHaveBeenCalledWith(5);
    });
  });

  describe('update', () => {
    it('deve atualizar um cliente e salvar com sucesso', async () => {
      const client = new Client();
      client.id = '1';

      clientRepositoryMock.findOne.mockResolvedValue(client);
      clientRepositoryMock.save.mockResolvedValue(client);

      const updateData = { id: '1', name: 'Lalisa Manobal' };

      const result = await clientsRepository.update(updateData);

      expect(clientRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: '1', deletedAt: undefined },
      });
      expect(clientRepositoryMock.save).toHaveBeenCalledWith(client);
      expect(result).toBe(client);
    });

    it('deve retornar null se o cliente não for encontrado', async () => {
      clientRepositoryMock.findOne.mockResolvedValue(null);

      const result = await clientsRepository.update({
        id: '1',
        name: 'Lalisa Manobal',
      });

      expect(result).toBeNull();
    });

    it('deve atualizar os campos solicitados', async () => {
      const client = new Client();
      client.id = '1';
      client.name = 'Old Name';

      clientRepositoryMock.findOne.mockResolvedValue(client);
      clientRepositoryMock.save.mockResolvedValue(client);

      const result = await clientsRepository.update({
        id: '1',
        name: 'New Name',
      });

      expect(client.name).toBe('New Name');
      expect(clientRepositoryMock.save).toHaveBeenCalledWith(client);
      expect(result).toBe(client);
    });
  });

  describe('delete', () => {
    it('deve deletar um cliente com sucesso', async () => {
      const client = new Client();
      client.id = '1';

      clientRepositoryMock.findOne.mockResolvedValue(client);
      clientRepositoryMock.save.mockResolvedValue(client);

      const result = await clientsRepository.delete('1');

      expect(client.deletedAt).not.toBeNull();
      expect(clientRepositoryMock.save).toHaveBeenCalledWith(client);
      expect(result).toBe(client);
    });

    it('deve retornar null se o cliente já estiver deletado', async () => {
      const client = new Client();
      client.id = '1';
      client.deletedAt = new Date();

      clientRepositoryMock.findOne.mockResolvedValue(client);

      const result = await clientsRepository.delete('1');

      expect(result).toBeNull();
    });

    it('deve retornar null se o cliente não for encontrado', async () => {
      clientRepositoryMock.findOne.mockResolvedValue(null);

      const result = await clientsRepository.delete('non-existing-id');

      expect(result).toBeNull();
    });

    it('deve lidar com valores de string para isDeleted', async () => {
      const queryBuilderMock = {
        andWhere: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      clientRepositoryMock.createQueryBuilder.mockReturnValue(
        queryBuilderMock as any
      );

      await clientsRepository.index({ isDeleted: true });

      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'client.deletedAt IS NOT NULL'
      );
    });
  });
});
