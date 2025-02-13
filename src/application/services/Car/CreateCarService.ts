import { CarsRepository } from '../../../domain/repositories/CarsRepository';
import Car from '../../../domain/entities/Car';
import { CreateCarDTO } from '../../../http/dtos/CreateCar.dto';

export class CreateCarService {
  constructor(
    private CarsRepository: CarsRepository
  ) { }

  public async execute({
    plate,
    brand,
    model,
    km,
    year,
    price,
    status,
    items,
  }: CreateCarDTO): Promise<Car> {

    // Required fields
    const data = [plate, brand, model, km, year, price, status, items];
    const data_names = ["placa", "marca", "modelo", "quilometragem", "ano", "preço", "status", "items"];
    for (const [index, info] of data.entries())
      if (info !== 0 && !info) throw new Error("Campo vazio: " + data_names[index]);

    status = status.toLowerCase().trim();
    const unique_items = [...new Set(items)].slice(0, 5);

    if (km < 0) throw new Error("A quilometragem do carro não pode ser negativa.");
    if (price < 0) throw new Error("O preço do carro não pode ser negativa.");
    if (year < 2014) throw new Error("O carro não pode ter mais de 11 anos.");

    // Status validation
    if (!["ativo", "inativo"].includes(status))
      throw new Error("O status do carro deve ser um dos seguintes: 'ativo' ou 'inativo'.");

    // Plate validation
    const regexPlate = /^[a-zA-Z]{3}[0-9]{4}$/;
    const regexPlateMercosul = /^[a-zA-Z]{3}[0-9]{1}[a-zA-Z]{1}[0-9]{2}$/;

    if (!regexPlate.test(plate) && !regexPlateMercosul.test(plate)) {
      throw new Error("Placa inválida.");
    }

    if (await this.CarsRepository.findByPlate(plate))
      throw new Error("Já existe um carro no sistema com a placa informada.");

    const car = this.CarsRepository.create({
      plate,
      brand,
      model,
      km,
      year,
      price,
      status,
      items: unique_items
    });

    return car;
  }
}

export default CreateCarService;
