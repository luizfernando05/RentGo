import { Order } from '../../../domain/entities/Order';
import { OrderRepository } from '../../../domain/repositories/OrderRepository';
import { OrderOutputDTO } from '../../../http/dtos/CreateOrder.dto';

export class ListOrderService {
  private orderRepository: OrderRepository;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
  }

  public async listOrders(
    params: OrderOutputDTO
  ): Promise<{ orders: Order[]; total: number; pages: number }> {
    return this.orderRepository.listOrders(params);
  }
}
