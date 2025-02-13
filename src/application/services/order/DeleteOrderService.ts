import { Order } from '../../../domain/entities/Order';
import CarsRepository from '../../../domain/repositories/CarsRepository';
import { OrderRepository } from '../../../domain/repositories/OrderRepository';

export class DeleteOrderService {
  private orderRepository: OrderRepository;
  private carRepository: CarsRepository;

  constructor(orderRepository: OrderRepository, carRepository: CarsRepository) {
    this.orderRepository = orderRepository;
    this.carRepository = carRepository;
  }

  public async softDeleteOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) throw new Error('Pedido não encontrado');

    if (order.status !== 'Aberto')
      throw new Error(
        'Apenas pedidos com status "Aberto" podem ser cancelados.'
      );

    order.status = 'Cancelado';
    order.cancellationDate = new Date();

    const car = await this.carRepository.findById(order.car.id);
    if (car) {
      car.status = 'ativo';
      await this.carRepository.save(car);
    }

    return await this.orderRepository.createOrder(order);
  }
}
