import CarsRepository from '../../../../src/domain/repositories/CarsRepository';
import { OrderRepository } from '../../../../src/domain/repositories/OrderRepository';
import DeleteCarService from '../../../../src/application/services/Car/DeleteCarService';
import Car from '../../../../src/domain/entities/Car';
import { Order } from '../../../../src/domain/entities/Order';

describe('DeleteCarService', () => {
  let carsRepository: CarsRepository;
  let orderRepository: OrderRepository;
  let deleteCarService: DeleteCarService;

  beforeEach(() => {
    carsRepository = {
      findById: jest.fn(),
      remove: jest.fn(),
    } as unknown as CarsRepository;

    orderRepository = {
      findOpenOrderByCarId: jest.fn(),
    } as unknown as OrderRepository;

    deleteCarService = new DeleteCarService(carsRepository, orderRepository);
  });

  it('deve excluir o carro com sucesso se não houver pedidos em aberto', async () => {
    const carMock: Car = {
      id: '123',
      plate: 'ABC1D23',
      brand: 'Rolls-Royce Limited',
      model: 'Wraith Black',
      km: 50000,
      year: 2021,
      price: 18300000,
      status: 'ativo',
      items: [],
      createdAt: new Date(),
      deletedAt: null,
      orders: [],
    };

    jest.spyOn(carsRepository, 'findById').mockResolvedValue(carMock);
    jest.spyOn(orderRepository, 'findOpenOrderByCarId').mockResolvedValue(null);

    await deleteCarService.execute('123');

    expect(carsRepository.findById).toHaveBeenCalledWith('123');
    expect(orderRepository.findOpenOrderByCarId).toHaveBeenCalledWith('123');
    expect(carsRepository.remove).toHaveBeenCalledWith(carMock);
  });

  it('deve lançar um erro se o carro não for encontrado', async () => {
    jest.spyOn(carsRepository, 'findById').mockResolvedValue(null);

    await expect(deleteCarService.execute('456')).rejects.toThrow(
      'Carro não encontrado.'
    );

    expect(carsRepository.findById).toHaveBeenCalledWith('456');
    expect(orderRepository.findOpenOrderByCarId).not.toHaveBeenCalled();
    expect(carsRepository.remove).not.toHaveBeenCalled();
  });

  it('deve lançar um erro se o carro tiver pedidos em aberto', async () => {
    const carMock: Car = {
      id: '123',
      plate: 'ABC1D23',
      brand: 'Rolls-Royce Limited',
      model: 'Wraith Black',
      km: 50000,
      year: 2021,
      price: 18300000,
      status: 'ativo',
      items: [],
      createdAt: new Date(),
      deletedAt: null,
      orders: [],
    };

    const orderMock: Order = {
      id: 'order-123',
      car: carMock,
      client: {} as any,
      status: 'Aberto',
      cep: null,
      city: null,
      state: null,
      totalValue: 0,
      initialDate: new Date(),
      finalDate: null,
      cancellationDate: null,
    };

    jest.spyOn(carsRepository, 'findById').mockResolvedValue(carMock);
    jest
      .spyOn(orderRepository, 'findOpenOrderByCarId')
      .mockResolvedValue(orderMock);

    await expect(deleteCarService.execute('123')).rejects.toThrow(
      'O carro não pode ser excluído pois tem pedidos em aberto.'
    );

    expect(carsRepository.findById).toHaveBeenCalledWith('123');
    expect(orderRepository.findOpenOrderByCarId).toHaveBeenCalledWith('123');
    expect(carsRepository.remove).not.toHaveBeenCalled();
  });
});
