import { CreateOrderService } from '../../../../src/application/services/order/CreateOrderService';
import { OrderRepository } from '../../../../src/domain/repositories/OrderRepository';
import ClientsRepository from '../../../../src/domain/repositories/ClientsRepository';
import CarsRepository from '../../../../src/domain/repositories/CarsRepository';
import { CreateOrderDTO } from '../../../../src/http/dtos/CreateOrder.dto';
import Client from '../../../../src/domain/entities/Client';
import Car from '../../../../src/domain/entities/Car';
import { Order } from '../../../../src/domain/entities/Order';

describe('CreateOrderService', () => {
  let orderRepository: jest.Mocked<OrderRepository>;
  let clientRepository: jest.Mocked<ClientsRepository>;
  let carRepository: jest.Mocked<CarsRepository>;
  let createOrderService: CreateOrderService;

  beforeEach(() => {
    orderRepository = {
      findOpenOrderByClientId: jest.fn(),
      createOrder: jest.fn(),
    } as Partial<jest.Mocked<OrderRepository>> as jest.Mocked<OrderRepository>;

    clientRepository = {
      findById: jest.fn(),
    } as Partial<
      jest.Mocked<ClientsRepository>
    > as jest.Mocked<ClientsRepository>;

    carRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as Partial<jest.Mocked<CarsRepository>> as jest.Mocked<CarsRepository>;

    createOrderService = new CreateOrderService(
      orderRepository,
      clientRepository,
      carRepository
    );
  });

  const mockClient = {
    id: 'client-1',
    name: 'Vincenzo Cassano',
    birthday: new Date('1990-01-01'),
    cpf: '12345678900',
    email: 'vincenzo@email.com',
    phone: '999999999',
    createdAt: new Date(),
    deletedAt: null,
    orders: [],
  } as Client;

  const mockCar = {
    id: 'car-1',
    plate: 'ABC1234',
    brand: 'Tesla',
    model: 'Model 3',
    km: 5000,
    year: 2020,
    price: 100,
    status: 'ativo',
    createdAt: new Date(),
    deletedAt: null,
    items: [],
    orders: [],
  } as Car;

  it('deve criar um pedido com sucesso', async () => {
    const mockOrder = {
      id: 'order-1',
      client: mockClient,
      car: { ...mockCar, status: 'ativo' },
      status: 'Aberto',
      initialDate: new Date(),
      finalDate: null,
      cancellationDate: null,
      cep: null,
      city: null,
      state: null,
      totalValue: mockCar.price,
    } as Order;

    clientRepository.findById.mockResolvedValue(mockClient);
    carRepository.findById.mockResolvedValue(mockCar);
    orderRepository.findOpenOrderByClientId.mockResolvedValue(null);
    orderRepository.createOrder.mockResolvedValue(mockOrder);

    const dto: CreateOrderDTO = { clientId: 'client-1', carId: 'car-1' };
    const result = await createOrderService.execute(dto);

    expect(clientRepository.findById).toHaveBeenCalledWith('client-1');
    expect(carRepository.findById).toHaveBeenCalledWith('car-1');
    expect(orderRepository.findOpenOrderByClientId).toHaveBeenCalledWith(
      'client-1'
    );
    expect(carRepository.save).toHaveBeenCalledWith({
      ...mockCar,
      status: 'inativo',
    });
    expect(orderRepository.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        client: mockClient,
        car: mockCar,
        totalValue: mockCar.price,
        status: 'Aberto',
      })
    );
    expect(result).toEqual(mockOrder);
  });

  it('deve lançar erro se o cliente não for encontrado', async () => {
    clientRepository.findById.mockResolvedValue(null);

    await expect(
      createOrderService.execute({ clientId: 'invalid-id', carId: 'car-1' })
    ).rejects.toThrow('Cliente não encontrado');

    expect(clientRepository.findById).toHaveBeenCalledWith('invalid-id');
    expect(carRepository.findById).not.toHaveBeenCalled();
    expect(orderRepository.findOpenOrderByClientId).not.toHaveBeenCalled();
  });

  it('deve lançar erro se o carro não for encontrado', async () => {
    clientRepository.findById.mockResolvedValue(mockClient);
    carRepository.findById.mockResolvedValue(null);

    await expect(
      createOrderService.execute({ clientId: 'client-1', carId: 'invalid-id' })
    ).rejects.toThrow('Carro não encontrado');

    expect(clientRepository.findById).toHaveBeenCalledWith('client-1');
    expect(carRepository.findById).toHaveBeenCalledWith('invalid-id');
  });

  it('deve lançar erro se o carro não estiver ativo', async () => {
    const mockCarInativo = { ...mockCar, status: 'inativo' };
    clientRepository.findById.mockResolvedValue(mockClient);
    carRepository.findById.mockResolvedValue(mockCarInativo);

    await expect(
      createOrderService.execute({ clientId: 'client-1', carId: 'car-1' })
    ).rejects.toThrow(
      'O carro selecionado não está ativo e não pode ser adicionado ao pedido.'
    );

    expect(carRepository.findById).toHaveBeenCalledWith('car-1');
  });

  it('deve lançar erro se o cliente já possuir um pedido aberto', async () => {
    clientRepository.findById.mockResolvedValue(mockClient);
    carRepository.findById.mockResolvedValue({ ...mockCar, status: 'ativo' });
    orderRepository.findOpenOrderByClientId.mockResolvedValue({
      id: 'order-1',
      client: mockClient,
      car: mockCar,
      status: 'Aberto',
      totalValue: 100,
    } as Partial<Order> as Order);

    await expect(
      createOrderService.execute({ clientId: 'client-1', carId: 'car-1' })
    ).rejects.toThrow('O cliente já possui um pedido aberto');

    expect(orderRepository.findOpenOrderByClientId).toHaveBeenCalledWith(
      'client-1'
    );
  });
});
