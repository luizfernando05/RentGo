import { DeleteOrderService } from '../../../../src/application/services/order/DeleteOrderService';
import { OrderRepository } from '../../../../src/domain/repositories/OrderRepository';
import CarsRepository from '../../../../src/domain/repositories/CarsRepository';
import { Order } from '../../../../src/domain/entities/Order';
import Car from '../../../../src/domain/entities/Car';

describe('DeleteOrderService', () => {
  let orderRepository: jest.Mocked<OrderRepository>;
  let carRepository: jest.Mocked<CarsRepository>;
  let deleteOrderService: DeleteOrderService;

  beforeEach(() => {
    orderRepository = {
      findById: jest.fn(),
      createOrder: jest.fn(),
    } as Partial<jest.Mocked<OrderRepository>> as jest.Mocked<OrderRepository>;

    carRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as Partial<jest.Mocked<CarsRepository>> as jest.Mocked<CarsRepository>;

    deleteOrderService = new DeleteOrderService(orderRepository, carRepository);
  });

  const mockOrder = {
    id: 'order-1',
    status: 'Aberto',
    cancellationDate: null,
    car: { id: 'car-1' },
  } as Partial<Order> as Order;

  const mockCar = {
    id: 'car-1',
    status: 'inativo',
  } as Partial<Car> as Car;

  it('deve cancelar um pedido com sucesso', async () => {
    orderRepository.findById.mockResolvedValue(mockOrder);
    carRepository.findById.mockResolvedValue(mockCar);
    orderRepository.createOrder.mockResolvedValue({
      ...mockOrder,
      status: 'Cancelado',
      cancellationDate: expect.any(Date),
    });

    const result = await deleteOrderService.softDeleteOrder('order-1');

    expect(orderRepository.findById).toHaveBeenCalledWith('order-1');
    expect(carRepository.findById).toHaveBeenCalledWith('car-1');
    expect(carRepository.save).toHaveBeenCalledWith({
      ...mockCar,
      status: 'ativo',
    });
    expect(orderRepository.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'order-1',
        status: 'Cancelado',
        cancellationDate: expect.any(Date),
      })
    );
    expect(result.status).toBe('Cancelado');
  });

  it('deve lançar erro se o pedido não for encontrado', async () => {
    orderRepository.findById.mockResolvedValue(null);

    await expect(
      deleteOrderService.softDeleteOrder('invalid-id')
    ).rejects.toThrow('Pedido não encontrado');

    expect(orderRepository.findById).toHaveBeenCalledWith('invalid-id');
    expect(carRepository.findById).not.toHaveBeenCalled();
    expect(orderRepository.createOrder).not.toHaveBeenCalled();
  });

  it('deve lançar erro se o pedido não estiver com status "Aberto"', async () => {
    orderRepository.findById.mockResolvedValue({
      ...mockOrder,
      status: 'Finalizado',
    });

    await expect(deleteOrderService.softDeleteOrder('order-1')).rejects.toThrow(
      'Apenas pedidos com status "Aberto" podem ser cancelados.'
    );

    expect(orderRepository.findById).toHaveBeenCalledWith('order-1');
    expect(carRepository.findById).not.toHaveBeenCalled();
    expect(orderRepository.createOrder).not.toHaveBeenCalled();
  });
});
