import { UpdateOrderService } from '../../../../src/application/services/order/UpdateOrderService';
import { OrderRepository } from '../../../../src/domain/repositories/OrderRepository';
import CarsRepository from '../../../../src/domain/repositories/CarsRepository';
import { Order } from '../../../../src/domain/entities/Order';
import { UpdateOrderDTO } from '../../../../src/http/dtos/UpdateOrder.dto';

jest.mock('node-fetch');
const fetch = require('node-fetch');
const { Response } = jest.requireActual('node-fetch');

describe('UpdateOrderService', () => {
  let updateOrderService: UpdateOrderService;
  let orderRepository: jest.Mocked<OrderRepository>;
  let carRepository: jest.Mocked<CarsRepository>;

  beforeEach(() => {
    orderRepository = {
      findById: jest.fn(),
      createOrder: jest.fn(),
    } as Partial<jest.Mocked<OrderRepository>> as jest.Mocked<OrderRepository>;

    carRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as Partial<jest.Mocked<CarsRepository>> as jest.Mocked<CarsRepository>;

    updateOrderService = new UpdateOrderService(orderRepository, carRepository);
  });

  const mockOrder = {
    id: 'order-1',
    status: 'Aberto',
    cep: null,
    city: null,
    state: null,
    initialDate: new Date(),
    finalDate: null,
    cancellationDate: null,
    totalValue: 100,
    car: { id: 'car-1', status: 'reservado' },
  } as Partial<Order> as Order;

  const mockViaCepResponse = {
    cep: '12345678',
    localidade: 'Fortaleza',
    uf: 'CE',
  };

  it('deve atualizar o pedido com data inicial e final válidas', async () => {
    const updatedInitialDate = new Date(Date.now() + 3600 * 1000);
    const updatedFinalDate = new Date(Date.now() + 7200 * 1000);

    orderRepository.findById.mockResolvedValue(mockOrder);
    orderRepository.createOrder.mockResolvedValue({
      ...mockOrder,
      initialDate: updatedInitialDate,
      finalDate: updatedFinalDate,
    });

    const updateOrderDTO: UpdateOrderDTO = {
      orderId: mockOrder.id,
      initialDate: updatedInitialDate,
      finalDate: updatedFinalDate,
    };

    const result = await updateOrderService.updateOrder(updateOrderDTO);

    expect(orderRepository.findById).toHaveBeenCalledWith(mockOrder.id);
    expect(orderRepository.createOrder).toHaveBeenCalledWith({
      ...mockOrder,
      initialDate: updatedInitialDate,
      finalDate: updatedFinalDate,
    });
    expect(result.initialDate).toEqual(updatedInitialDate);
    expect(result.finalDate).toEqual(updatedFinalDate);
  });

  it('deve lançar erro ao tentar atualizar o pedido com data inicial inválida', async () => {
    const invalidInitialDate = new Date(Date.now() - 3600 * 1000);

    orderRepository.findById.mockResolvedValue(mockOrder);

    const updateOrderDTO: UpdateOrderDTO = {
      orderId: mockOrder.id,
      initialDate: invalidInitialDate,
    };

    await expect(
      updateOrderService.updateOrder(updateOrderDTO)
    ).rejects.toThrow(
      'A Data Hora Inicial não pode ser menor que a data/hora atual.'
    );
  });

  it('deve validar o CEP e atualizar a cidade e estado do pedido', async () => {
    fetch.mockResolvedValue(
      new Response(JSON.stringify(mockViaCepResponse), { status: 200 })
    );

    orderRepository.findById.mockResolvedValue(mockOrder);
    orderRepository.createOrder.mockResolvedValue({
      ...mockOrder,
      cep: mockViaCepResponse.cep,
      city: mockViaCepResponse.localidade,
      state: mockViaCepResponse.uf,
    });

    const updateOrderDTO: UpdateOrderDTO = {
      orderId: mockOrder.id,
      cep: mockViaCepResponse.cep,
    };

    const result = await updateOrderService.updateOrder(updateOrderDTO);

    expect(fetch).toHaveBeenCalledWith(
      `https://viacep.com.br/ws/${mockViaCepResponse.cep}/json/`
    );
    expect(orderRepository.createOrder).toHaveBeenCalledWith({
      ...mockOrder,
      cep: mockViaCepResponse.cep,
      city: mockViaCepResponse.localidade,
      state: mockViaCepResponse.uf,
    });
    expect(result.cep).toEqual(mockViaCepResponse.cep);
    expect(result.city).toEqual(mockViaCepResponse.localidade);
    expect(result.state).toEqual(mockViaCepResponse.uf);
  });

  it('deve lançar erro para um CEP inválido', async () => {
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ erro: true }), { status: 200 })
    );

    orderRepository.findById.mockResolvedValue(mockOrder);

    const updateOrderDTO: UpdateOrderDTO = {
      orderId: mockOrder.id,
      cep: '00000000',
    };

    await expect(
      updateOrderService.updateOrder(updateOrderDTO)
    ).rejects.toThrow('CEP não encontrado');
  });

  it('deve cancelar um pedido e atualizar o status do carro', async () => {
    const car = {
      id: 'car-1',
      status: 'reservado',
      plate: 'BRA2E19',
      brand: 'Tesla',
      model: 'Model 3',
      km: 5000,
      year: 2020,
      price: 20000,
      items: [],
      createdAt: new Date(1696369654000),
      deletedAt: null,
      orders: [],
    };

    orderRepository.findById.mockResolvedValue(mockOrder);
    carRepository.findById.mockResolvedValue(car);

    orderRepository.createOrder.mockResolvedValue({
      ...mockOrder,
      status: 'Cancelado',
      cancellationDate: new Date(),
    });

    const updateOrderDTO: UpdateOrderDTO = {
      orderId: mockOrder.id,
      status: 'Cancelado',
    };

    const result = await updateOrderService.updateOrder(updateOrderDTO);

    expect(orderRepository.findById).toHaveBeenCalledWith(mockOrder.id);
    expect(carRepository.save).toHaveBeenCalledWith({
      ...car,
      status: 'ativo',
    });
    expect(result.status).toBe('Cancelado');
  });

  it('deve lançar erro ao tentar aprovar um pedido incompleto', async () => {
    orderRepository.findById.mockResolvedValue({
      ...mockOrder,
      cep: null,
      city: null,
      state: null,
    });

    const updateOrderDTO: UpdateOrderDTO = {
      orderId: mockOrder.id,
      status: 'Aprovado',
    };

    await expect(
      updateOrderService.updateOrder(updateOrderDTO)
    ).rejects.toThrow(
      'O pedido precisa estar "Aberto" e todos os campos devem estar preenchidos para ser aprovado.'
    );
  });
});
