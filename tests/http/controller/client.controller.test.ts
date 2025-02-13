import CreateClientService from '../../../src/application/services/client/CreateClientService';
import ReadClientService from '../../../src/application/services/client/ReadClientService';
import ListClientService from '../../../src/application/services/client/ListClientService';
import UpdateClientService from '../../../src/application/services/client/UpdateClientService';
import DeleteClientService from '../../../src/application/services/client/DeleteClientService';
import { json } from 'stream/consumers';
const ClientController = require('../../../src/http/controller/ClientController');

jest.mock('../../../src/application/services/client/CreateClientService');
jest.mock('../../../src/application/services/client/ReadClientService');
jest.mock('../../../src/application/services/client/ListClientService');
jest.mock('../../../src/application/services/client/UpdateClientService');
jest.mock('../../../src/application/services/client/DeleteClientService');

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ClientController - create', () => {
  it('deve criar um cliente e retornar status 200 com o cliente', async () => {
    const mockReq = {
      body: {
        name: 'Vincenzo Cassano',
        birthday: '1990-01-01',
        cpf: '88677532315',
        email: 'vincenzo@email.com',
        phone: '123456789',
      },
    } as any;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const clientMock = { id: '123', ...mockReq.body };
    (CreateClientService.prototype.execute as jest.Mock).mockResolvedValue(
      clientMock
    );

    await ClientController.create(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(clientMock);
  });

  it('deve retornar status 400 se o CPF for inválido', async () => {
    const mockReq = {
      body: {
        name: 'Vincenzo Cassano',
        cpf: 'invalidCPF',
      },
    } as any;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await ClientController.create(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid cpf' });
  });

  it('deve retornar status 500 se ocorrer um erro inesperado', async () => {
    const mockReq = {
      body: {
        name: 'Vincenzo Cassano',
        cpf: '88677532315',
        email: 'vincenzo@email.com',
      },
    } as any;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    (CreateClientService.prototype.execute as jest.Mock).mockRejectedValue(
      new Error('Unexpected Error')
    );

    await ClientController.create(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
  });

  it('deve retornar status 400 se o email for inválido', async () => {
    const mockReq = {
      body: {
        name: 'Vincenzo Cassano',
        cpf: '88677532315',
        email: 'email-invalido',
      },
    } as any;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await ClientController.create(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid email' });
  });
});

describe('ClientController - findById', () => {
  it('deve retornar um cliente com status 200', async () => {
    const mockReq = { params: { id: '123' } } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const clientMock = { id: '123', name: 'Vincezo Cassano' };
    (ReadClientService.prototype.execute as jest.Mock).mockResolvedValue(
      clientMock
    );

    await ClientController.findById(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(clientMock);
  });

  it('deve retornar status 404 se o cliente não for encontrado', async () => {
    const mockReq = { params: { id: '123' } } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    (ReadClientService.prototype.execute as jest.Mock).mockResolvedValue(null);

    await ClientController.findById(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Client not found' });
  });
});

describe('ClientController - index', () => {
  it('deve listar os clientes com status 200', async () => {
    const mockReq = { query: {} } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const clientsMock = {
      data: [
        { id: '1', name: 'Vincenzo Cassano' },
        { id: '2', name: 'Lalisa Manobal' },
      ],
      total: 2,
    };
    (ListClientService.prototype.execute as jest.Mock).mockResolvedValue(
      clientsMock
    );

    await ClientController.index(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(clientsMock);
  });
});

describe('ClientController - update', () => {
  it('deve atualizar um cliente e retornar status 200', async () => {
    const mockReq = {
      params: { id: '123' },
      body: { name: 'Lalisa Manobal' },
    } as any;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const updatedClient = { id: '123', name: 'Lalisa Manobal' };
    (UpdateClientService.prototype.execute as jest.Mock).mockResolvedValue(
      updatedClient
    );

    await ClientController.update(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(updatedClient);
  });

  it('deve retornar status 404 se o cliente não for encontrado', async () => {
    const mockReq = {
      params: { id: 'invalid' },
      body: { name: 'Lalisa Manobal' },
    } as any;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    (UpdateClientService.prototype.execute as jest.Mock).mockResolvedValue(
      null
    );

    await ClientController.update(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Client not found or is already deleted',
    });
  });

  it('deve retornar status 400 se o CPF for inválido durante a atualização', async () => {
    const mockReq = {
      params: { id: '123' },
      body: { cpf: 'cpf-invalido' },
    } as any;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await ClientController.update(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid cpf' });
  });
});

describe('ClientController - delete', () => {
  it('deve deletar um cliente com sucesso', async () => {
    const mockReq = { params: { id: '123' } } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    (DeleteClientService.prototype.execute as jest.Mock).mockResolvedValue(
      true
    );

    await ClientController.delete(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Client deleted successfully',
    });
  });

  it('deve retornar status 404 se o cliente não for encontrado', async () => {
    const mockReq = { params: { id: 'invalid' } } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    (DeleteClientService.prototype.execute as jest.Mock).mockResolvedValue(
      null
    );

    await ClientController.delete(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Client not found or is already deleted',
    });
  });
});
