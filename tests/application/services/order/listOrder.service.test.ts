import { ListOrderService } from '../../../../src/application/services/order/ListOrdersService';
import { OrderRepository } from '../../../../src/domain/repositories/OrderRepository';
import { Order } from '../../../../src/domain/entities/Order';
import { OrderOutputDTO } from '../../../../src/http/dtos/CreateOrder.dto';

describe('ListOrderService', () => {
  let orderRepository: jest.Mocked<OrderRepository>;
  let listOrderService: ListOrderService;

  beforeEach(() => {
    orderRepository = {
      listOrders: jest.fn(),
    } as Partial<jest.Mocked<OrderRepository>> as jest.Mocked<OrderRepository>;

    listOrderService = new ListOrderService(orderRepository);
  });

  const mockOrders = [
    {
      id: 'order-1',
      status: 'Aberto',
      car: { id: 'car-1', model: 'Model X' },
      client: { id: 'client-1', name: 'Client Name', cpf: '12345678900' },
      totalValue: 100,
      initialDate: new Date(),
    },
    {
      id: 'order-2',
      status: 'Cancelado',
      car: { id: 'car-2', model: 'Model Y' },
      client: { id: 'client-2', name: 'Another Client', cpf: '09876543210' },
      totalValue: 200,
      initialDate: new Date(),
    },
  ] as Partial<Order>[] as Order[];

  const mockPaginatedResponse = {
    orders: mockOrders,
    total: 2,
    pages: 1,
  };

  it('deve retornar a lista de pedidos com paginação', async () => {
    const params: OrderOutputDTO = {
      status: 'Aberto',
      page: 1,
      limit: 10,
      sortOrder: 'ASC',
    };

    orderRepository.listOrders.mockResolvedValue(mockPaginatedResponse);

    const result = await listOrderService.listOrders(params);

    expect(orderRepository.listOrders).toHaveBeenCalledWith(params);
    expect(result).toEqual(mockPaginatedResponse);
  });

  it('deve retornar uma lista vazia se não houver pedidos', async () => {
    const params: OrderOutputDTO = {
      status: 'Cancelado',
      page: 1,
      limit: 10,
      sortOrder: 'DESC',
    };

    orderRepository.listOrders.mockResolvedValue({
      orders: [],
      total: 0,
      pages: 0,
    });

    const result = await listOrderService.listOrders(params);

    expect(orderRepository.listOrders).toHaveBeenCalledWith(params);
    expect(result).toEqual({ orders: [], total: 0, pages: 0 });
  });
});
