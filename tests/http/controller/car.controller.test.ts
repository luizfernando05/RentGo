import CreateCarService from '../../../src/application/services/Car/CreateCarService';
import ShowCarService from '../../../src/application/services/Car/ShowCarService';
import ListCarService from '../../../src/application/services/Car/ListCarService';
import UpdateCarService from '../../../src/application/services/Car/UpdateCarService';
import DeleteCarService from '../../../src/application/services/Car/DeleteCarService';
const CarController = require('../../../src/http/controller/CarController');

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock('../../../src/application/services/Car/CreateCarService');
jest.mock('../../../src/application/services/Car/ShowCarService');
jest.mock('../../../src/application/services/Car/ListCarService');
jest.mock('../../../src/application/services/Car/UpdateCarService');
jest.mock('../../../src/application/services/Car/DeleteCarService');

describe('CarController - create', () => {
  it('deve criar um carro e retornar status 201 com o ID', async () => {
    const mockReq = {
      body: {
        plate: 'ABC1D23',
        brand: 'Toyota',
        model: 'Corolla',
        km: 5000,
        year: 2021,
        price: 75000,
        status: 'ativo',
        items: [],
      },
    } as any;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const carMock = { id: '123' };
    (CreateCarService.prototype.execute as jest.Mock).mockResolvedValue(
      carMock
    );

    await CarController.create(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({ id: '123' });
  });

  it('deve retornar status 400 se ocorrer um erro esperado', async () => {
    const mockReq = { body: {} } as any;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    (CreateCarService.prototype.execute as jest.Mock).mockRejectedValue(
      new Error('Dados inválidos')
    );

    await CarController.create(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Dados inválidos' });
  });
});

describe('CarController - show', () => {
  it('deve retornar um carro com status 200', async () => {
    const mockReq = { params: { id: '123' } } as any;
    const mockRes = {
      json: jest.fn(),
    } as any;

    const carMock = {
      id: '123',
      plate: 'ABC1D23',
      brand: 'Toyota',
      model: 'Corolla',
      km: 5000,
      year: 2021,
      price: 75000,
      status: 'ativo',
      items: [],
    };
    (ShowCarService.prototype.execute as jest.Mock).mockResolvedValue(carMock);

    await CarController.show(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith(carMock);
  });

  it('deve retornar status 400 em caso de erro esperado', async () => {
    const mockReq = { params: { id: 'invalid' } } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    (ShowCarService.prototype.execute as jest.Mock).mockRejectedValue(
      new Error('Carro não encontrado')
    );

    await CarController.show(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Carro não encontrado',
    });
  });
});

describe('CarController - list', () => {
  it('deve retornar uma lista de carros com status 200', async () => {
    const mockReq = { query: {} } as any;
    const mockRes = {
      json: jest.fn(),
      sendStatus: jest.fn(),
    } as any;

    const carsMock = {
      data: [
        { id: '1', plate: 'ABC1D23', brand: 'Toyota', model: 'Corolla' },
        { id: '2', plate: 'XYZ4E56', brand: 'Honda', model: 'Civic' },
      ],
      total: 2,
    };
    (ListCarService.prototype.execute as jest.Mock).mockResolvedValue(carsMock);

    await CarController.list(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith(carsMock);
  });

  it('deve retornar status 204 se nenhum carro for encontrado', async () => {
    const mockReq = { query: {} } as any;
    const mockRes = {
      sendStatus: jest.fn(),
    } as any;

    (ListCarService.prototype.execute as jest.Mock).mockResolvedValue({
      data: [],
      total: 0,
    });

    await CarController.list(mockReq, mockRes);

    expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
  });
});

describe('CarController - update', () => {
  it('deve atualizar um carro e retornar status 204', async () => {
    const mockReq = {
      params: { id: '123' },
      body: {
        plate: 'ABC1D23',
        brand: 'Toyota',
        model: 'Corolla',
        km: 10000,
        year: 2021,
        price: 80000,
        status: 'ativo',
        items: ['ar-condicionado', 'direção-hidráulica'],
      },
    } as any;

    const mockRes = {
      sendStatus: jest.fn(),
    } as any;

    (UpdateCarService.prototype.execute as jest.Mock).mockResolvedValue(
      undefined
    );

    await CarController.update(mockReq, mockRes);

    expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
    expect(UpdateCarService.prototype.execute).toHaveBeenCalledWith('123', {
      plate: 'ABC1D23',
      brand: 'Toyota',
      model: 'Corolla',
      km: 10000,
      year: 2021,
      price: 80000,
      status: 'ativo',
      items: ['ar-condicionado', 'direção-hidráulica'],
    });
  });

  it('deve retornar status 400 se ocorrer um erro esperado', async () => {
    const mockReq = {
      params: { id: 'invalid' },
      body: {
        plate: 'ABC1D23',
        brand: 'Toyota',
        model: 'Corolla',
        km: 10000,
        year: 2021,
        price: 80000,
        status: 'ativo',
        items: ['ar-condicionado', 'direção-hidráulica'],
      },
    } as any;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    (UpdateCarService.prototype.execute as jest.Mock).mockRejectedValue(
      new Error('Carro não encontrado')
    );

    await CarController.update(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Carro não encontrado',
    });
  });
});

describe('CarController - delete', () => {
  it('deve deletar um carro e retornar status 204', async () => {
    const mockReq = { params: { id: '123' } } as any;
    const mockRes = {
      sendStatus: jest.fn(),
    } as any;

    (DeleteCarService.prototype.execute as jest.Mock).mockResolvedValue(
      undefined
    );

    await CarController.delete(mockReq, mockRes);

    expect(mockRes.sendStatus).toHaveBeenCalledWith(204);
  });

  it('deve retornar status 400 se ocorrer um erro esperado', async () => {
    const mockReq = { params: { id: 'invalid' } } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    (DeleteCarService.prototype.execute as jest.Mock).mockRejectedValue(
      new Error('Carro não encontrado')
    );

    await CarController.delete(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Carro não encontrado',
    });
  });
});
