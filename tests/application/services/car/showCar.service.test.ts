import CarsRepository from '../../../../src/domain/repositories/CarsRepository';
import Car from '../../../../src/domain/entities/Car';
import CarItem from '../../../../src/domain/entities/CarItem';
import ShowCarService from '../../../../src/application/services/Car/ShowCarService';

describe('ShowCarService', () => {
  let carsRepository: CarsRepository;
  let showCarService: ShowCarService;

  beforeEach(() => {
    carsRepository = {
      findById: jest.fn(),
    } as unknown as CarsRepository;

    showCarService = new ShowCarService(carsRepository);
  });

  it('deve retornar os dados de um carro existente', async () => {
    const carMock: Car = {
      id: '123',
      plate: 'ABC1D23',
      brand: 'Rolls-Royce Limited',
      model: 'Wraith Black',
      km: 50000,
      year: 2021,
      price: 18300000,
      status: 'ativo',
      items: [
        { id: 'item1', name: 'ar condicionado' } as CarItem,
        { id: 'item2', name: 'vidros elétricos' } as CarItem,
      ],
      createdAt: new Date('2021-01-01'),
      deletedAt: null,
      orders: [],
    };

    jest.spyOn(carsRepository, 'findById').mockResolvedValue(carMock);

    const result = await showCarService.execute('123');

    expect(carsRepository.findById).toHaveBeenCalledWith('123');
    expect(result).toEqual({
      id: '123',
      plate: 'ABC1D23',
      brand: 'Rolls-Royce Limited',
      model: 'Wraith Black',
      km: 50000,
      year: 2021,
      price: 18300000,
      status: 'ativo',
      items: ['ar condicionado', 'vidros elétricos'],
      createdAt: new Date('2021-01-01'),
      orders: [],
    });
  });

  it('deve lançar um erro se o carro não for encontrado', async () => {
    jest.spyOn(carsRepository, 'findById').mockResolvedValue(null);

    await expect(showCarService.execute('456')).rejects.toThrow(
      'Carro não encontrado.'
    );
    expect(carsRepository.findById).toHaveBeenCalledWith('456');
  });
});
