import { FindOrderService } from '../../../../src/application/services/order/FindOrderService';
import { OrderRepository } from '../../../../src/domain/repositories/OrderRepository';
import { Order } from '../../../../src/domain/entities/Order';

describe('FindOrderService', () => {
  let orderRepository: jest.Mocked<OrderRepository>;
  let findOrderService: FindOrderService;

  beforeEach(() => {
    orderRepository = {
      findById: jest.fn(),
    } as Partial<jest.Mocked<OrderRepository>> as jest.Mocked<OrderRepository>;

    findOrderService = new FindOrderService(orderRepository);
  });

  const mockOrder = {
    id: 'order-1',
    status: 'Aberto',
    car: { id: 'car-1', model: 'Model X' },
    client: { id: 'client-1', name: 'Client Name' },
    totalValue: 100,
    initialDate: new Date(),
  } as Partial<Order> as Order;

  it('deve retornar um pedido quando encontrado', async () => {
    orderRepository.findById.mockResolvedValue(mockOrder);

    const result = await findOrderService.findOrderById('order-1');

    expect(orderRepository.findById).toHaveBeenCalledWith('order-1');
    expect(result).toEqual(mockOrder);
  });

  it('deve lançar erro quando o pedido não for encontrado', async () => {
    orderRepository.findById.mockResolvedValue(null);

    await expect(findOrderService.findOrderById('invalid-id')).rejects.toThrow(
      'Pedido nao encontrado'
    );

    expect(orderRepository.findById).toHaveBeenCalledWith('invalid-id');
  });
});
