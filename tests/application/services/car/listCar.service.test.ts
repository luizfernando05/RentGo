import ListCarService from '../../../../src/application/services/Car/ListCarService';
import CarsRepository from '../../../../src/domain/repositories/CarsRepository';
import { ListCarParams } from '../../../../src/application/params/ListCarsParams.type';
import Car from '../../../../src/domain/entities/Car';

jest.mock('../../../../src/domain/repositories/CarsRepository');

describe('ListCarService', () => {
  let carsRepositoryMock: jest.Mocked<CarsRepository>;
  let listCarService: ListCarService;

  beforeEach(() => {
    carsRepositoryMock = {
      findAll: jest.fn(),
    } as unknown as jest.Mocked<CarsRepository>;

    listCarService = new ListCarService(carsRepositoryMock);
  });

  it('deve retornar a lista de carros paginada com os itens formatados', async () => {
    const carMock = new Car();
    carMock.id = '123';
    carMock.plate = 'ABC1D23';
    carMock.brand = 'Toyota';
    carMock.model = 'Corolla';
    carMock.km = 10000;
    carMock.year = 2022;
    carMock.price = 150000;
    carMock.status = 'ativo';
    carMock.items = [
      { id: '1', name: 'ar condicionado', car: carMock },
      { id: '2', name: 'direção hidráulica', car: carMock },
    ];

    const paginatedCarsMock = {
      per_page: 10,
      total: 1,
      current_page: 1,
      data: [carMock],
    };

    carsRepositoryMock.findAll.mockResolvedValue(paginatedCarsMock);

    const listParams: ListCarParams = {
      page: 1,
      limit: 10,
    };

    const result = await listCarService.execute(listParams);

    expect(result.data).toHaveLength(1);
    expect(result.data[0]).toEqual({
      id: '123',
      plate: 'ABC1D23',
      brand: 'Toyota',
      model: 'Corolla',
      km: 10000,
      year: 2022,
      price: 150000,
      status: 'ativo',
      createdAt: undefined,
      deletedAt: undefined,
      items: ['ar condicionado', 'direção hidráulica'],
    });

    expect(carsRepositoryMock.findAll).toHaveBeenCalledWith(listParams);
  });

  it('deve truncar a lista de itens para no máximo 5', async () => {
    const carMock = new Car();
    carMock.id = '123';
    carMock.items = [
      { id: '1', name: 'item1', car: carMock },
      { id: '2', name: 'item2', car: carMock },
      { id: '3', name: 'item3', car: carMock },
      { id: '4', name: 'item4', car: carMock },
      { id: '5', name: 'item5', car: carMock },
      { id: '6', name: 'item6', car: carMock },
    ];

    const paginatedCarsMock = {
      per_page: 10,
      total: 1,
      current_page: 1,
      data: [carMock],
    };

    carsRepositoryMock.findAll.mockResolvedValue(paginatedCarsMock);

    const result = await listCarService.execute({});

    expect(result.data[0].items).toHaveLength(5);
    expect(result.data[0].items).toEqual([
      'item1',
      'item2',
      'item3',
      'item4',
      'item5',
    ]);
  });

  it('deve retornar uma lista vazia se nenhum carro for encontrado', async () => {
    const paginatedCarsMock = {
      per_page: 10,
      total: 0,
      current_page: 1,
      data: [],
    };

    carsRepositoryMock.findAll.mockResolvedValue(paginatedCarsMock);

    const result = await listCarService.execute({});

    expect(result.data).toHaveLength(0);
    expect(carsRepositoryMock.findAll).toHaveBeenCalledWith({});
  });

  it('deve aplicar corretamente os filtros passados nos parâmetros', async () => {
    const paginatedCarsMock = {
      per_page: 10,
      total: 0,
      current_page: 1,
      data: [],
    };

    const listParams: ListCarParams = {
      status: 'ativo',
      brand: 'Toyota',
      minPrice: 50000,
      maxPrice: 150000,
      orderBy: 'price',
      orderDirection: 'ASC',
    };

    carsRepositoryMock.findAll.mockResolvedValue(paginatedCarsMock);

    await listCarService.execute(listParams);

    expect(carsRepositoryMock.findAll).toHaveBeenCalledWith(listParams);
  });

  it('deve manter a lista de itens única e truncada no resultado final', async () => {
    const carMock = new Car();
    carMock.id = '123';
    carMock.items = [
      { id: '1', name: 'item1', car: carMock },
      { id: '2', name: 'item2', car: carMock },
      { id: '3', name: 'item1', car: carMock },
      { id: '4', name: 'item3', car: carMock },
      { id: '5', name: 'item3', car: carMock },
      { id: '6', name: 'item4', car: carMock },
    ];

    const paginatedCarsMock = {
      per_page: 10,
      total: 1,
      current_page: 1,
      data: [carMock],
    };

    carsRepositoryMock.findAll.mockResolvedValue(paginatedCarsMock);

    const result = await listCarService.execute({});

    expect(result.data[0].items).toHaveLength(4);
    expect(result.data[0].items).toEqual(['item1', 'item2', 'item3', 'item4']);
  });
});
