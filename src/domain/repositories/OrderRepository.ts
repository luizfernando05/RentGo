import { DataSource, Repository } from 'typeorm';
import { Order } from '../entities/Order';

interface ListOrdersOptions {
  status?: string;
  clientCpf?: string;
  startDate?: Date;
  endDate?: Date;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export class OrderRepository {
  private repository: Repository<Order>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Order);
  }

  public async findById(orderId: string): Promise<Order | null> {
    return this.repository.findOne({
      where: { id: orderId },
      relations: ['client', 'car', 'car.items'],
    });
  }

  // find all orders from a specific customer
  public async findByClientId(clientId: string): Promise<Order[]> {
    return this.repository.find({
      where: { client: { id: clientId } },
      relations: ['client', 'car'],
    });
  }

  // find open orders from a customer
  public async findOpenOrderByClientId(
    clientId: string
  ): Promise<Order | null> {
    const order = await this.repository.findOne({
      where: { client: { id: clientId }, status: 'Aberto' },
      relations: ['client', 'car'],
    });
    return order ?? null;
  }

  // find open orders with a car
  public async findOpenOrderByCarId(
    carId: string
  ): Promise<Order | null> {
    const order = await this.repository.findOne({
      where: { car: { id: carId }, status: 'Aberto' },
      relations: ['client', 'car'],
    });
    return order ?? null;
  }

  // create a order
  public async createOrder(orderData: Partial<Order>): Promise<Order> {
    const order = this.repository.create(orderData);
    return await this.repository.save(order);
  }

  // list orders with filters, sorting and pagination
  public async listOrders({
    status,
    clientCpf,
    startDate,
    endDate,
    sortOrder = 'ASC',
    page = 1,
    limit = 10,
  }: ListOrdersOptions): Promise<{
    orders: Order[];
    total: number;
    pages: number;
  }> {
    const query = this.repository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.client', 'client');

    if (status) {
      query.andWhere('order.status = :status', { status });
    }

    if (clientCpf) {
      query.andWhere('client.cpf = :clientCpf', { clientCpf });
    }

    if (startDate && endDate) {
      query.andWhere(
        '(order.initialDate BETWEEN :startDate AND :endDate OR order.finalDate BETWEEN :startDate AND :endDate)',
        { startDate, endDate }
      );
    } else if (startDate) {
      query.andWhere(
        '(order.initialDate >= :startDate OR (order.finalDate IS NOT NULL AND order.finalDate >= :startDate))',
        { startDate }
      );
    } else if (endDate) {
      query.andWhere(
        '(order.initialDate <= :endDate OR (order.finalDate IS NOT NULL AND order.finalDate <= :endDate))',
        { endDate }
      );
    }

    query.orderBy('order.initialDate', sortOrder);

    const total = await query.getCount();
    const pages = Math.ceil(total / limit);
    const orders = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { orders, total, pages };
  }
}
