import { Order } from '../../../domain/entities/Order';
import { OrderRepository } from '../../../domain/repositories/OrderRepository';

export class FindOrderService {
  private orderRepository: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  public async findOrderById(orderId: string): Promise<Order | null> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) throw new Error('Pedido nao encontrado');

    return order;
  }
}
