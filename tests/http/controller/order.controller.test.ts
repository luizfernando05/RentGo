import { CreateOrderService } from '../../../src/application/services/order/CreateOrderService';
import { FindOrderService } from '../../../src/application/services/order/FindOrderService';
import { ListOrderService } from '../../../src/application/services/order/ListOrdersService';
import { UpdateOrderService } from '../../../src/application/services/order/UpdateOrderService';
import { DeleteOrderService } from '../../../src/application/services/order/DeleteOrderService';
const OrderController = require('../../../src/http/controller/OrderController');

jest.mock('../../../src/application/services/order/CreateOrderService');
jest.mock('../../../src/application/services/order/FindOrderService');
jest.mock('../../../src/application/services/order/ListOrdersService');
jest.mock('../../../src/application/services/order/UpdateOrderService');
jest.mock('../../../src/application/services/order/DeleteOrderService');

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('OrderController - create', () => {
  it('deve criar uma ordem e retornar status 201', async () => {
    const mockReq = { body: { clientId: '1', carId: '2' } } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const orderMock = { id: '123', clientId: '1', carId: '2' };
    (CreateOrderService.prototype.execute as jest.Mock).mockResolvedValue(
      orderMock
    );

    await OrderController.create(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(orderMock);
  });

  it('deve retornar status 400 se campos obrigatórios estiverem ausentes', async () => {
    const mockReq = { body: {} } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await OrderController.create(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'O campo clientId é obrigatório.',
    });
  });

  it('deve retornar status 400 se ocorrer um erro no serviço', async () => {
    const mockReq = { body: { clientId: '1', carId: '2' } } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    (CreateOrderService.prototype.execute as jest.Mock).mockRejectedValue(
      new Error('Erro inesperado')
    );

    await OrderController.create(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Erro inesperado' });
  });
});

describe('OrderController - findById', () => {
  it('deve retornar uma ordem com status 200', async () => {
    const mockReq = { params: { id: '123' } } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const orderMock = { id: '123', clientId: '1', carId: '2' };
    (FindOrderService.prototype.findOrderById as jest.Mock).mockResolvedValue(
      orderMock
    );

    await OrderController.findById(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(orderMock);
  });

  it('deve retornar status 404 se a ordem não for encontrada', async () => {
    const mockReq = { params: { id: '123' } } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    (FindOrderService.prototype.findOrderById as jest.Mock).mockResolvedValue(
      null
    );

    await OrderController.findById(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Pedido não encontrado.',
    });
  });

  it('deve retornar status 400 se ocorrer um erro inesperado', async () => {
    const mockReq = { params: { id: '123' } } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    (FindOrderService.prototype.findOrderById as jest.Mock).mockRejectedValue(
      new Error('Erro inesperado')
    );

    await OrderController.findById(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Erro inesperado' });
  });
});

describe('OrderController - list', () => {
  it('deve listar ordens com status 200', async () => {
    const mockReq = { query: {} } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const ordersMock = {
      data: [{ id: '1' }, { id: '2' }],
      total: 2,
    };
    (ListOrderService.prototype.listOrders as jest.Mock).mockResolvedValue(
      ordersMock
    );

    await OrderController.list(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(ordersMock);
  });

  it('deve retornar status 400 se ocorrer um erro inesperado ao listar ordens', async () => {
    const mockReq = { query: {} } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    (ListOrderService.prototype.listOrders as jest.Mock).mockRejectedValue(
      new Error('Erro inesperado')
    );

    await OrderController.list(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Erro inesperado' });
  });
});

describe('OrderController - update', () => {
  it('deve atualizar uma ordem e retornar status 200', async () => {
    const mockReq = {
      params: { id: '123' },
      body: { status: 'Aprovado' },
    } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const updatedOrder = { id: '123', status: 'Aprovado' };
    (UpdateOrderService.prototype.updateOrder as jest.Mock).mockResolvedValue(
      updatedOrder
    );

    await OrderController.update(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(updatedOrder);
  });

  it('deve retornar status 400 se o status for inválido', async () => {
    const mockReq = {
      params: { id: '123' },
      body: { status: 'Invalid' },
    } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await OrderController.update(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error:
        'O campo status deve ser um dos seguintes valores: Aprovado, Cancelado.',
    });
  });

  it('deve retornar status 400 se ocorrer um erro inesperado ao atualizar', async () => {
    const mockReq = {
      params: { id: '123' },
      body: { status: 'Aprovado' },
    } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    (UpdateOrderService.prototype.updateOrder as jest.Mock).mockRejectedValue(
      new Error('Erro inesperado')
    );

    await OrderController.update(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Erro inesperado' });
  });

  it('deve retornar status 400 se o CEP for inválido', async () => {
    const mockReq = {
      params: { id: '123' },
      body: { cep: '12345' },
    } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await OrderController.update(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'O campo CEP deve estar no formato 00000-000 ou 00000000.',
    });
  });

  it('deve retornar status 400 se o status for inválido', async () => {
    const mockReq = {
      params: { id: '123' },
      body: { status: 'Invalido' },
    } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    await OrderController.update(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error:
        'O campo status deve ser um dos seguintes valores: Aprovado, Cancelado.',
    });
  });
});

describe('OrderController - delete', () => {
  it('deve deletar uma ordem com sucesso', async () => {
    const mockReq = { params: { id: '123' } } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    (
      DeleteOrderService.prototype.softDeleteOrder as jest.Mock
    ).mockResolvedValue(true);

    await OrderController.delete(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Pedido deleteado com sucesso.',
    });
  });

  it('deve retornar status 404 se a ordem não for encontrada', async () => {
    const mockReq = { params: { id: 'invalid' } } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    (
      DeleteOrderService.prototype.softDeleteOrder as jest.Mock
    ).mockResolvedValue(null);

    await OrderController.delete(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Pedido não encontrado.',
    });
  });

  it('deve retornar status 400 se ocorrer um erro inesperado ao deletar', async () => {
    const mockReq = { params: { id: '123' } } as any;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    (
      DeleteOrderService.prototype.softDeleteOrder as jest.Mock
    ).mockRejectedValue(new Error('Erro inesperado'));

    await OrderController.delete(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Erro inesperado' });
  });
});
