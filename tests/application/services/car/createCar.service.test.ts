import CreateCarService from '../../../../src/application/services/Car/CreateCarService';
import CarsRepository from '../../../../src/domain/repositories/CarsRepository';
import { CreateCarDTO } from '../../../../src/http/dtos/CreateCar.dto';
import Car from '../../../../src/domain/entities/Car';

jest.mock('../../../../src/domain/repositories/CarsRepository');

describe('CreateCarService', () => {
  let createCarService: CreateCarService;
  let carsRepositoryMock: jest.Mocked<CarsRepository>;

  beforeEach(() => {
    carsRepositoryMock = new CarsRepository() as jest.Mocked<CarsRepository>;
    createCarService = new CreateCarService(carsRepositoryMock);
  });

  it('deve criar um carro com sucesso', async () => {
    const carData: CreateCarDTO = {
      plate: 'ABC1D23',
      brand: 'Toyota',
      model: 'Corolla',
      km: 5000,
      year: 2022,
      price: 120000,
      status: 'ativo',
      items: ['ar condicionado', 'direção hidráulica'],
    };

    const createdCar = new Car();
    Object.assign(createdCar, {
      ...carData,
      id: '1',
      createdAt: new Date(),
    });

    carsRepositoryMock.findByPlate.mockResolvedValue(null);
    carsRepositoryMock.create.mockResolvedValue(createdCar);

    const result = await createCarService.execute(carData);

    expect(carsRepositoryMock.findByPlate).toHaveBeenCalledWith(carData.plate);
    expect(carsRepositoryMock.create).toHaveBeenCalledWith({
      ...carData,
      items: ['ar condicionado', 'direção hidráulica'],
    });
    expect(result).toEqual(createdCar);
  });

  it('deve lançar um erro ao tentar criar um carro com placa duplicada', async () => {
    const carData: CreateCarDTO = {
      plate: 'ABC1D23',
      brand: 'Toyota',
      model: 'Corolla',
      km: 5000,
      year: 2022,
      price: 120000,
      status: 'ativo',
      items: ['ar condicionado', 'direção hidráulica'],
    };

    const existingCar = new Car();
    carsRepositoryMock.findByPlate.mockResolvedValue(existingCar);

    await expect(createCarService.execute(carData)).rejects.toThrow(
      'Já existe um carro no sistema com a placa informada.'
    );

    expect(carsRepositoryMock.findByPlate).toHaveBeenCalledWith(carData.plate);
    expect(carsRepositoryMock.create).not.toHaveBeenCalled();
  });

  it('deve lançar um erro para campos obrigatórios ausentes', async () => {
    const carData = {
      plate: '',
      brand: 'Toyota',
      model: 'Corolla',
      km: 5000,
      year: 2022,
      price: 120000,
      status: 'ativo',
      items: ['ar condicionado'],
    } as CreateCarDTO;

    await expect(createCarService.execute(carData)).rejects.toThrow(
      'Campo vazio: placa'
    );

    expect(carsRepositoryMock.findByPlate).not.toHaveBeenCalled();
    expect(carsRepositoryMock.create).not.toHaveBeenCalled();
  });

  it('deve lançar um erro para status inválido', async () => {
    const carData: CreateCarDTO = {
      plate: 'ABC1D23',
      brand: 'Toyota',
      model: 'Corolla',
      km: 5000,
      year: 2022,
      price: 120000,
      status: 'indefinido',
      items: ['ar condicionado', 'direção hidráulica'],
    };

    await expect(createCarService.execute(carData)).rejects.toThrow(
      "O status do carro deve ser um dos seguintes: 'ativo' ou 'inativo'."
    );

    expect(carsRepositoryMock.findByPlate).not.toHaveBeenCalled();
    expect(carsRepositoryMock.create).not.toHaveBeenCalled();
  });

  it('deve lançar um erro para placa inválida', async () => {
    const carData: CreateCarDTO = {
      plate: 'INVALID123',
      brand: 'Toyota',
      model: 'Corolla',
      km: 5000,
      year: 2022,
      price: 120000,
      status: 'ativo',
      items: ['ar condicionado', 'direção hidráulica'],
    };

    await expect(createCarService.execute(carData)).rejects.toThrow(
      'Placa inválida.'
    );

    expect(carsRepositoryMock.findByPlate).not.toHaveBeenCalled();
    expect(carsRepositoryMock.create).not.toHaveBeenCalled();
  });

  it('deve lançar erro se a placa já existir', async () => {
    const carData: CreateCarDTO = {
      plate: 'ABC1D23',
      brand: 'Toyota',
      model: 'Corolla',
      km: 5000,
      year: 2022,
      price: 120000,
      status: 'ativo',
      items: ['ar condicionado', 'direção hidráulica'],
    };

    const existingCar = new Car();
    carsRepositoryMock.findByPlate.mockResolvedValue(existingCar);

    await expect(createCarService.execute(carData)).rejects.toThrow(
      'Já existe um carro no sistema com a placa informada.'
    );

    expect(carsRepositoryMock.findByPlate).toHaveBeenCalledWith(carData.plate);
    expect(carsRepositoryMock.create).not.toHaveBeenCalled();
  });

  it('deve lançar erro se o carro tiver mais de 11 anos', async () => {
    const carData: CreateCarDTO = {
      plate: 'ABC1D23',
      brand: 'Toyota',
      model: 'Corolla',
      km: 5000,
      year: 2010,
      price: 120000,
      status: 'ativo',
      items: ['ar condicionado', 'direção hidráulica'],
    };

    await expect(createCarService.execute(carData)).rejects.toThrow(
      'O carro não pode ter mais de 11 anos.'
    );

    expect(carsRepositoryMock.findByPlate).not.toHaveBeenCalled();
    expect(carsRepositoryMock.create).not.toHaveBeenCalled();
  });

  it('deve lançar erro se a quilometragem for negativa', async () => {
    const carData: CreateCarDTO = {
      plate: 'ABC1D23',
      brand: 'Toyota',
      model: 'Corolla',
      km: -100,
      year: 2022,
      price: 120000,
      status: 'ativo',
      items: ['ar condicionado', 'direção hidráulica'],
    };

    await expect(createCarService.execute(carData)).rejects.toThrow(
      'A quilometragem do carro não pode ser negativa.'
    );

    expect(carsRepositoryMock.findByPlate).not.toHaveBeenCalled();
    expect(carsRepositoryMock.create).not.toHaveBeenCalled();
  });

  it('deve lançar erro se o preço for negativo', async () => {
    const carData: CreateCarDTO = {
      plate: 'ABC1D23',
      brand: 'Toyota',
      model: 'Corolla',
      km: 5000,
      year: 2022,
      price: -50000,
      status: 'ativo',
      items: ['ar condicionado', 'direção hidráulica'],
    };

    await expect(createCarService.execute(carData)).rejects.toThrow(
      'O preço do carro não pode ser negativa.'
    );

    expect(carsRepositoryMock.findByPlate).not.toHaveBeenCalled();
    expect(carsRepositoryMock.create).not.toHaveBeenCalled;
  });
});
