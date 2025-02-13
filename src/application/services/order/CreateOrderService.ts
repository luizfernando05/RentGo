import { Order } from '../../../domain/entities/Order';
import { CarsRepository } from '../../../domain/repositories/CarsRepository';
import ClientsRepository from '../../../domain/repositories/ClientsRepository';
import { OrderRepository } from '../../../domain/repositories/OrderRepository';
import { CreateOrderDTO } from '../../../http/dtos/CreateOrder.dto';

export class CreateOrderService {
  private orderRepository: OrderRepository;
  private clientRepository: ClientsRepository;
  private carRepository: CarsRepository;

  constructor(
    orderRepository: OrderRepository,
    clientRepository: ClientsRepository,
    carRepository: CarsRepository
  ) {
    this.orderRepository = orderRepository;
    this.clientRepository = clientRepository;
    this.carRepository = carRepository;
  }

  public async execute({ clientId, carId }: CreateOrderDTO): Promise<Order> {
    const clientDto: string = clientId;

    // check by id if a client exists
    const client = await this.clientRepository.findById(clientDto);
    if (!client) {
      throw new Error('Cliente não encontrado');
    }

    // check by id if a car exists
    const car = await this.carRepository.findById(carId);
    if (!car) {
      throw new Error('Carro não encontrado');
    }
    if (car.status !== 'ativo') {
      throw new Error(
        'O carro selecionado não está ativo e não pode ser adicionado ao pedido.'
      );
    }

    // checks if a customer has an open order
    const existingOrder =
      await this.orderRepository.findOpenOrderByClientId(clientId);
    if (existingOrder) {
      throw new Error('O cliente já possui um pedido aberto');
    }

    car.status = 'inativo';
    await this.carRepository.save(car);

    const totalValue = car.price ?? 0;

    const order = this.orderRepository.createOrder({
      client,
      car,
      status: 'Aberto',
      finalDate: null,
      cancellationDate: null,
      cep: null,
      city: null,
      state: null,
      totalValue,
      initialDate: new Date(),
    });

    return order;
  }
}
