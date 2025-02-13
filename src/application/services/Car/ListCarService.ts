import { CarsRepository } from '../../../domain/repositories/CarsRepository';
import Car from '../../../domain/entities/Car';
import { IShowCar } from './ShowCarService';
import { ListCarParams } from '../../params/ListCarsParams.type';

export interface IPaginateCar {
  per_page: number;
  total: number;
  current_page: number;
  data: (IShowCar | Car)[];
}

export class ListCarService {
  constructor(private CarsRepository: CarsRepository) {}

  public async execute(listParams: ListCarParams): Promise<IPaginateCar> {
    let cars = await this.CarsRepository.findAll(listParams);

    cars.data = (cars.data as Car[]).map((car: Car) => {
      const { items, deletedAt, ...info_car } = car;

      const uniqueItems = [...new Set(items.map((item) => item.name))].slice(
        0,
        5
      );

      const ret_car: IShowCar = {
        ...info_car,
        items: uniqueItems,
      };

      return ret_car;
    });

    return cars;
  }
}

export default ListCarService;
