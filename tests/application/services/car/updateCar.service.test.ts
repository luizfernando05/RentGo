import { UpdateCarService } from '../../../../src/application/services/Car/UpdateCarService';
import { CarsRepository } from '../../../../src/domain/repositories/CarsRepository';
import { UpdateCarDTO } from '../../../../src/http/dtos/UpdateCar.dto';
import Car from '../../../../src/domain/entities/Car';

jest.mock('../../../../src/domain/repositories/CarsRepository');

describe('UpdateCarService', () => {
  let carsRepositoryMock: jest.Mocked<CarsRepository>;
  let updateCarService: UpdateCarService;

  beforeEach(() => {
    carsRepositoryMock = {
      findById: jest.fn(),
      findByPlate: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<CarsRepository>;

    updateCarService = new UpdateCarService(carsRepositoryMock);
  });

  it('deve atualizar um carro com dados válidos', async () => {
    const carMock = new Car();
    carMock.id = '123';
    carMock.plate = 'ABC1D23';

    const updatedCarMock = { ...carMock, brand: 'Toyota' };

    carsRepositoryMock.findById.mockResolvedValue(carMock);
    carsRepositoryMock.findByPlate.mockResolvedValue(null);
    carsRepositoryMock.update.mockResolvedValue(updatedCarMock);

    const updateData: UpdateCarDTO = {
      plate: undefined,
      brand: 'Toyota',
      model: undefined,
      km: undefined,
      year: undefined,
      price: undefined,
      status: undefined,
      items: undefined,
    };

    const result = await updateCarService.execute('123', updateData);

    expect(result).toEqual(updatedCarMock);
    expect(carsRepositoryMock.findById).toHaveBeenCalledWith('123');
    expect(carsRepositoryMock.update).toHaveBeenCalledWith(carMock, {
      ...updateData,
      items: [],
    });
  });

  it('deve lançar erro se o carro não for encontrado', async () => {
    carsRepositoryMock.findById.mockResolvedValue(null);

    await expect(
      updateCarService.execute('invalid-id', {} as UpdateCarDTO)
    ).rejects.toThrow('Carro não encontrado.');

    expect(carsRepositoryMock.findById).toHaveBeenCalledWith('invalid-id');
    expect(carsRepositoryMock.update).not.toHaveBeenCalled();
  });

  it('deve lançar erro se nenhuma informação for enviada para atualizar', async () => {
    const carMock = new Car();
    carsRepositoryMock.findById.mockResolvedValue(carMock);

    await expect(
      updateCarService.execute('123', {} as UpdateCarDTO)
    ).resolves.toEqual(carMock);

    expect(carsRepositoryMock.findById).toHaveBeenCalledWith('123');
    expect(carsRepositoryMock.update).not.toHaveBeenCalled();
  });

  it('deve lançar erro se a quilometragem for negativa', async () => {
    const carMock = new Car();
    carsRepositoryMock.findById.mockResolvedValue(carMock);

    const updateData: UpdateCarDTO = {
      km: -100,
    } as UpdateCarDTO;

    await expect(updateCarService.execute('123', updateData)).rejects.toThrow(
      'A quilometragem do carro não pode ser negativa.'
    );

    expect(carsRepositoryMock.update).not.toHaveBeenCalled();
  });

  it('deve lançar erro se o preço for negativo', async () => {
    const carMock = new Car();
    carsRepositoryMock.findById.mockResolvedValue(carMock);

    const updateData: UpdateCarDTO = {
      price: -50000,
    } as UpdateCarDTO;

    await expect(updateCarService.execute('123', updateData)).rejects.toThrow(
      'O preço do carro não pode ser negativa.'
    );

    expect(carsRepositoryMock.update).not.toHaveBeenCalled();
  });

  it('deve lançar erro se o carro tiver mais de 11 anos', async () => {
    const carMock = new Car();
    carsRepositoryMock.findById.mockResolvedValue(carMock);

    const updateData: UpdateCarDTO = {
      year: 2010,
    } as UpdateCarDTO;

    await expect(updateCarService.execute('123', updateData)).rejects.toThrow(
      'O carro não pode ter mais de 11 anos.'
    );

    expect(carsRepositoryMock.update).not.toHaveBeenCalled();
  });

  it('deve lançar erro se a placa for inválida', async () => {
    const carMock = new Car();
    carsRepositoryMock.findById.mockResolvedValue(carMock);

    const updateData: UpdateCarDTO = {
      plate: 'INVALID_PLATE',
    } as UpdateCarDTO;

    await expect(updateCarService.execute('123', updateData)).rejects.toThrow(
      'Placa inválida.'
    );

    expect(carsRepositoryMock.update).not.toHaveBeenCalled();
  });

  it('deve lançar erro se já existir outro carro com a nova placa', async () => {
    const carMock = new Car();
    carMock.id = '123';
    carsRepositoryMock.findById.mockResolvedValue(carMock);

    const existingCarMock = new Car();
    existingCarMock.id = '456';

    carsRepositoryMock.findByPlate.mockResolvedValue(existingCarMock);

    const updateData: UpdateCarDTO = {
      plate: 'ABC1D23',
    } as UpdateCarDTO;

    await expect(updateCarService.execute('123', updateData)).rejects.toThrow(
      'Já existe outro carro no sistema com a placa informada.'
    );

    expect(carsRepositoryMock.findByPlate).toHaveBeenCalledWith(
      updateData.plate
    );
    expect(carsRepositoryMock.update).not.toHaveBeenCalled();
  });
});
