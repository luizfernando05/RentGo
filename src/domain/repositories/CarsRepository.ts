import { Repository } from 'typeorm';
import Car from '../entities/Car';
import { AppDataSource } from '../../infra/data-source';
import { CreateCarDTO } from '../../http/dtos/CreateCar.dto';
import { UpdateCarDTO } from '../../http/dtos/UpdateCar.dto';
import { IPaginateCar } from '../../application/services/Car/ListCarService';
import { ListCarParams } from '../../application/params/ListCarsParams.type';

export class CarsRepository {
  private ormRepository: Repository<Car>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(Car);
  }

  public async create({
    plate,
    brand,
    model,
    km,
    year,
    price,
    status,
    items,
  }: CreateCarDTO): Promise<Car> {
    const car_items = items.map(item => { return { name: item } });

    const car = this.ormRepository.create({ plate, brand, model, km, year, price, status, items: car_items });

    await this.ormRepository.save(car);

    return car;
  }

  public async update(car: Car, {
    plate,
    brand,
    model,
    km,
    year,
    price,
    status,
    items,
  }: UpdateCarDTO): Promise<Car> {
    const car_items = items?.map(item => { return { name: item } });

    await this.ormRepository.update({ id: car.id! }, { plate, brand, model, km, year, price, status });

    if (items && items.length > 0)
      await this.ormRepository.save({ id: car.id, items: car_items });

    return car;
  }

  public async save(car: Car): Promise<Car> {
    await this.ormRepository.save(car);

    return car;
  }

  public async remove(car: Car): Promise<void> {
    car.deletedAt = new Date();
    car.status = "excluído";
    await this.ormRepository.save(car);
  }

  public async findById(id: string): Promise<Car | null> {
    return this.ormRepository.findOne({ where: { id }, relations: ['items'] });
  }

  public async findByPlate(plate: string): Promise<Car | null> {
    return this.ormRepository.findOne({ where: { plate }, relations: ['items'] });
  }

  public async findAll({
    page,
    limit,
    status,
    endPlate,
    brand,
    model,
    items,
    km,
    fromYear,
    untilYear,
    minPrice,
    maxPrice,
    orderBy,
    orderDirection,
  }: ListCarParams): Promise<IPaginateCar> {
    if (!page) page = 1;
    if (!limit) limit = 10;

    const skip = (page - 1) * limit;

    const queryBuilder = this.ormRepository
      .createQueryBuilder('car')
      .leftJoin('car.items', 'items')
      .select('car.id')
      .skip(skip)
      .take(limit);

    // Filters
    if (status)
      queryBuilder.andWhere('car.status = :status', { status });

    if (brand)
      queryBuilder.andWhere('car.brand = :brand', { brand });

    if (model)
      queryBuilder.andWhere('car.model = :model', { model });

    if (endPlate)
      queryBuilder.andWhere('car.plate LIKE :endPlate', {
        endPlate: `%${endPlate[endPlate.length - 1]}` // Make sure can only search by last character of plate
      });

    if (km)
      queryBuilder.andWhere('car.km <= :km', { km });

    if (fromYear)
      queryBuilder.andWhere('car.year >= :fromYear', { fromYear });

    if (untilYear)
      queryBuilder.andWhere('car.year <= :untilYear', { untilYear });

    if (minPrice)
      queryBuilder.andWhere('car.price >= :minPrice', { minPrice });

    if (maxPrice)
      queryBuilder.andWhere('car.price <= :maxPrice', { maxPrice });

    if (items) {
      for (const item of items)
        queryBuilder.andWhere('items.name = :item', { item });
    }

    // Get ids of cars based on the fields for filtering
    const [cars_ids, count] = await queryBuilder.getManyAndCount();

    if (cars_ids.length === 0)
      return {
        per_page: Number(limit),
        total: count,
        current_page: Number(page),
        data: []
      }

    // Get the rest of the car's informartion based on the ids and add ordering
    const cars = await this.ormRepository
      .createQueryBuilder('car')
      .leftJoinAndSelect('car.items', 'items')
      .andWhere('car.id IN (:...ids)', { ids: cars_ids.map(id => id.id) })
      .orderBy(
        orderBy ? `car.${orderBy}` : 'car.id',
        orderDirection || 'ASC'
      )
      .getMany();

    return {
      per_page: Number(limit),
      total: count,
      current_page: Number(page),
      data: cars
    };
  }
}

export default CarsRepository;
