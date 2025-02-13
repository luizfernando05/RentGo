import { mock } from 'jest-mock-extended';
import { DataSource, Repository } from 'typeorm';
import { OrderRepository } from '../../../src/domain/repositories/OrderRepository';
import { Order } from '../../../src/domain/entities/Order';

describe('OrderRepository', () => {
  const mockDataSource = mock<DataSource>();
  const mockRepository = mock<Repository<Order>>();
  let orderRepository: OrderRepository;

  beforeEach(() => {
    mockDataSource.getRepository.mockReturnValue(mockRepository);
    orderRepository = new OrderRepository(mockDataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve buscar um pedido pelo ID', async () => {
    const mockOrder = { id: '1', client: {}, car: {} } as Order;
    mockRepository.findOne.mockResolvedValue(mockOrder);

    const result = await orderRepository.findById('1');

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: '1' },
      relations: ['client', 'car', 'car.items'],
    });
    expect(result).toEqual(mockOrder);
  });

  it('deve buscar pedidos por cliente', async () => {
    const mockOrders = [{ id: '1', client: {}, car: {} }] as Order[];
    mockRepository.find.mockResolvedValue(mockOrders);

    const result = await orderRepository.findByClientId('client1');

    expect(mockRepository.find).toHaveBeenCalledWith({
      where: { client: { id: 'client1' } },
      relations: ['client', 'car'],
    });
    expect(result).toEqual(mockOrders);
  });

  it('deve buscar pedido aberto por cliente', async () => {
    const mockOrder = {
      id: '1',
      status: 'Aberto',
      client: {},
      car: {},
    } as Order;
    mockRepository.findOne.mockResolvedValue(mockOrder);

    const result = await orderRepository.findOpenOrderByClientId('client1');

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { client: { id: 'client1' }, status: 'Aberto' },
      relations: ['client', 'car'],
    });
    expect(result).toEqual(mockOrder);
  });

  it('deve buscar pedido aberto por carro', async () => {
    const mockOrder = {
      id: '1',
      status: 'Aberto',
      client: {},
      car: {},
    } as Order;
    mockRepository.findOne.mockResolvedValue(mockOrder);

    const result = await orderRepository.findOpenOrderByCarId('car1');

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { car: { id: 'car1' }, status: 'Aberto' },
      relations: ['client', 'car'],
    });
    expect(result).toEqual(mockOrder);
  });

  it('deve criar um pedido', async () => {
    const orderData = {
      id: '1',
      status: 'Aberto',
      totalValue: 100,
    } as Partial<Order>;
    const mockOrder = { ...orderData } as Order;

    mockRepository.create.mockReturnValue(mockOrder);
    mockRepository.save.mockResolvedValue(mockOrder);

    const result = await orderRepository.createOrder(orderData);

    expect(mockRepository.create).toHaveBeenCalledWith(orderData);
    expect(mockRepository.save).toHaveBeenCalledWith(mockOrder);
    expect(result).toEqual(mockOrder);
  });

  it('deve listar pedidos com filtros, ordenação e paginação', async () => {
    const mockOrders = [
      { id: '1', status: 'Aberto', totalValue: 100 } as Order,
    ];
    mockRepository.createQueryBuilder.mockImplementation(() => {
      const mockQueryBuilder: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockOrders),
        getCount: jest.fn().mockResolvedValue(1),
      };
      return mockQueryBuilder;
    });

    const result = await orderRepository.listOrders({
      status: 'Aberto',
      page: 1,
      limit: 10,
    });

    expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('order');
    expect(result).toEqual({
      orders: mockOrders,
      total: 1,
      pages: 1,
    });
  });
});
