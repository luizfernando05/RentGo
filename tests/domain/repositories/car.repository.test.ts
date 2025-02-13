import { Repository } from 'typeorm';
import { CarsRepository } from '../../../src/domain/repositories/CarsRepository';
import Car from '../../../src/domain/entities/Car';
import { AppDataSource } from '../../../src/infra/data-source';
import { ListCarParams } from '../../../src/application/params/ListCarsParams.type';

jest.mock('../../../src/infra/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('CarsRepository', () => {
  let carsRepository: CarsRepository;
  let carRepositoryMock: jest.Mocked<Repository<Car>>;

  beforeEach(() => {
    carRepositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    } as unknown as jest.Mocked<Repository<Car>>;

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(
      carRepositoryMock
    );
    carsRepository = new CarsRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar e salvar um carro com sucesso', async () => {
      const carData = {
        plate: 'ABC1234',
        brand: 'Toyota',
        model: 'Corolla',
        km: 10000,
        year: 2022,
        price: 100000.0,
        status: 'available',
        items: ['Air Conditioning', 'GPS'],
      };

      const car = new Car();
      carRepositoryMock.create.mockReturnValue(car);
      carRepositoryMock.save.mockResolvedValue(car);

      const result = await carsRepository.create(carData);

      expect(carRepositoryMock.create).toHaveBeenCalledWith({
        ...carData,
        items: [{ name: 'Air Conditioning' }, { name: 'GPS' }],
      });
      expect(carRepositoryMock.save).toHaveBeenCalledWith(car);
      expect(result).toBe(car);
    });
  });

  describe('update', () => {
    it('deve atualizar e salvar um carro com sucesso', async () => {
      const existingCar = new Car();
      existingCar.id = '1';
      const updatedCarData = {
        plate: 'XYZ9876',
        brand: 'Honda',
        model: 'Civic',
        km: 5000,
        year: 2023,
        price: 120000.0,
        status: 'available',
        items: ['Sunroof', 'Leather Seats'],
      };

      carRepositoryMock.update.mockResolvedValue({} as any);
      carRepositoryMock.save.mockResolvedValue(existingCar);

      const result = await carsRepository.update(existingCar, updatedCarData);

      expect(carRepositoryMock.update).toHaveBeenCalledWith(
        { id: existingCar.id },
        { ...updatedCarData, items: undefined }
      );
      expect(carRepositoryMock.save).toHaveBeenCalledWith({
        id: existingCar.id,
        items: [{ name: 'Sunroof' }, { name: 'Leather Seats' }],
      });
      expect(result).toBe(existingCar);
    });

    it('deve atualizar um carro sem atualizar os itens, caso não sejam fornecidos', async () => {
      const car = new Car();
      car.id = '1';

      carRepositoryMock.update.mockResolvedValue({} as any);

      const updatedCarData = {
        plate: 'XYZ9876',
        brand: 'Honda',
        model: 'Civic',
        km: 5000,
        year: 2023,
        price: 120000.0,
        status: 'available',
        items: undefined,
      };

      const result = await carsRepository.update(car, updatedCarData);

      expect(carRepositoryMock.update).toHaveBeenCalledWith(
        { id: car.id },
        {
          plate: updatedCarData.plate,
          brand: updatedCarData.brand,
          model: updatedCarData.model,
          km: updatedCarData.km,
          year: updatedCarData.year,
          price: updatedCarData.price,
          status: updatedCarData.status,
        }
      );
      expect(carRepositoryMock.save).not.toHaveBeenCalled();
      expect(result).toBe(car);
    });
  });

  describe('remove', () => {
    it('deve deletar um carro', async () => {
      const car = new Car();
      car.id = '1';
      car.status = 'available';

      carRepositoryMock.save.mockResolvedValue(car);

      await carsRepository.remove(car);

      expect(car.deletedAt).not.toBeNull();
      expect(car.status).toBe('excluído');
      expect(carRepositoryMock.save).toHaveBeenCalledWith(car);
    });
  });

  describe('findById', () => {
    it('deve encontrar um carro pelo ID', async () => {
      const car = new Car();
      car.id = '1';

      carRepositoryMock.findOne.mockResolvedValue(car);

      const result = await carsRepository.findById(car.id);

      expect(carRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: car.id },
        relations: ['items'],
      });
      expect(result).toBe(car);
    });

    it('deve retornar null se um carro não existir', async () => {
      carRepositoryMock.findOne.mockResolvedValue(null);

      const result = await carsRepository.findById('non-existing-id');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os carros com filtros, paginação e ordenação', async () => {
      const filters: ListCarParams = {
        page: 1,
        limit: 10,
        status: 'ativo',
        brand: 'Toyota',
        model: 'Corolla',
        orderBy: 'price',
        orderDirection: 'DESC',
      };

      const car1 = new Car();
      const car2 = new Car();
      const mockCars = [car1, car2];
      const count = 2;

      const queryBuilderMock = {
        leftJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([mockCars, count]),
        getMany: jest.fn().mockResolvedValue(mockCars),
      };

      carRepositoryMock.createQueryBuilder.mockReturnValue(
        queryBuilderMock as any
      );

      const result = await carsRepository.findAll(filters);

      expect(queryBuilderMock.leftJoin).toHaveBeenCalledWith(
        'car.items',
        'items'
      );
      expect(result.data).toEqual(mockCars);
      expect(result.total).toBe(count);
      expect(result.per_page).toBe(filters.limit);
      expect(result.current_page).toBe(filters.page);
    });
  });

  describe('findByPlate', () => {
    it('deve retornar um carro pela placa', async () => {
      const car = new Car();
      car.plate = 'ABC1234';

      carRepositoryMock.findOne.mockResolvedValue(car);

      const result = await carsRepository.findByPlate(car.plate);

      expect(carRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { plate: car.plate },
        relations: ['items'],
      });
      expect(result).toBe(car);
    });

    it('deve retornar null se não encontrar o carro pela placa', async () => {
      carRepositoryMock.findOne.mockResolvedValue(null);

      const result = await carsRepository.findByPlate('non-existing-plate');

      expect(result).toBeNull();
    });
  });

  describe('findAll - filters', () => {
    let queryBuilderMock: any;

    beforeEach(() => {
      queryBuilderMock = {
        leftJoin: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      carRepositoryMock.createQueryBuilder.mockReturnValue(queryBuilderMock);
    });

    it('deve filtrar carros por endPlate', async () => {
      await carsRepository.findAll({ endPlate: '4' });

      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'car.plate LIKE :endPlate',
        { endPlate: '%4' }
      );
    });

    it('deve filtrar carros por km', async () => {
      await carsRepository.findAll({ km: 50000 });

      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith('car.km <= :km', {
        km: 50000,
      });
    });

    it('deve filtrar carros por year range', async () => {
      await carsRepository.findAll({ fromYear: 2020, untilYear: 2023 });

      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'car.year >= :fromYear',
        { fromYear: 2020 }
      );
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'car.year <= :untilYear',
        { untilYear: 2023 }
      );
    });

    it('deve filtrar carros por price range', async () => {
      await carsRepository.findAll({ minPrice: 20000, maxPrice: 40000 });

      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'car.price >= :minPrice',
        { minPrice: 20000 }
      );
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'car.price <= :maxPrice',
        { maxPrice: 40000 }
      );
    });

    it('deve filtrar carros por items', async () => {
      await carsRepository.findAll({ items: ['Air Conditioning', 'GPS'] });

      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'items.name = :item',
        { item: 'Air Conditioning' }
      );
      expect(queryBuilderMock.andWhere).toHaveBeenCalledWith(
        'items.name = :item',
        { item: 'GPS' }
      );
    });
  });
});
