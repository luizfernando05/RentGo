import { CarsRepository } from '../../../domain/repositories/CarsRepository';
import Car from '../../../domain/entities/Car';
import { UpdateCarDTO } from '../../../http/dtos/UpdateCar.dto';

export class UpdateCarService {
  constructor(
    private CarsRepository: CarsRepository
  ) { }

  public async execute(id: string, {
    plate,
    brand,
    model,
    km,
    year,
    price,
    status,
    items
  }: UpdateCarDTO): Promise<Car> {
    status = status?.toLowerCase().trim();

    const unique_items = [...new Set(items)].slice(0, 5);

    if (km && km < 0) throw new Error("A quilometragem do carro não pode ser negativa.");
    if (price && price < 0) throw new Error("O preço do carro não pode ser negativa.");
    if (year && year < 2014) throw new Error("O carro não pode ter mais de 11 anos.");

    // Status validation
    if (status && !["ativo", "inativo"].includes(status))
      throw new Error("O status do carro deve ser um dos seguintes: 'ativo' ou 'inativo'.");

    // Plate validation
    const regexPlate = /^[a-zA-Z]{3}[0-9]{4}$/;
    const regexPlateMercosul = /^[a-zA-Z]{3}[0-9]{1}[a-zA-Z]{1}[0-9]{2}$/;

    if (plate && !regexPlate.test(plate) && !regexPlateMercosul.test(plate)) {
      throw new Error("Placa inválida.");
    }

    // Check if car exists
    const car = await this.CarsRepository.findById(id);

    if (!car)
      throw new Error("Carro não encontrado.");

    // No fields to update
    if (!plate && !brand && !model && !km && !year && !price && !status && !items)
      return car;

    // Check if there's no other car with the new plate if specified
    if (plate) {
      const carByPlate = await this.CarsRepository.findByPlate(plate);
      if (carByPlate && carByPlate.id !== car.id)
        throw new Error("Já existe outro carro no sistema com a placa informada.");
    }

    const updatedCar = await this.CarsRepository.update(car, {
      plate,
      brand,
      model,
      km,
      year,
      price,
      status,
      items: unique_items
    });

    return updatedCar;
  }
}

export default UpdateCarService;
