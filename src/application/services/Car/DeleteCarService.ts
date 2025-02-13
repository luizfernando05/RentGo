import { CarsRepository } from '../../../domain/repositories/CarsRepository';
import { OrderRepository } from '../../../domain/repositories/OrderRepository';

export class DeleteCarService {
  constructor(
    private CarsRepository: CarsRepository,
    private OrderRepository: OrderRepository
  ) { }

  public async execute(id: string): Promise<void> {
    const car = await this.CarsRepository.findById(id);

    if (!car)
      throw new Error("Carro não encontrado.");

    if (await this.OrderRepository.findOpenOrderByCarId(id))
      throw new Error("O carro não pode ser excluído pois tem pedidos em aberto.");

    await this.CarsRepository.remove(car);
  }
}

export default DeleteCarService;
