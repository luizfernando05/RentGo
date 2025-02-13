import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import Car from '../../domain/entities/Car';
import CarItem from '../../domain/entities/CarItem';

export class CarSeeder implements Seeder {
  track?: boolean | undefined;

  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<void> {
    const carRepository = dataSource.getRepository(Car);
    const carItemRepository = dataSource.getRepository(CarItem);

    const carData = {
      plate: 'ABC1D23',
      brand: 'Rolls-Royce Limited',
      model: 'Wraith Black',
      km: 50000,
      year: 2021,
      price: 18300000,
      status: 'ativo',
    };

    const carItemsData = [
      { name: 'ar condicionado' },
      { name: 'vidros elétricos' },
      { name: 'direção hidráulica' },
    ];

    const carExists = await carRepository.findOneBy({
      plate: carData.plate,
    });

    if (!carExists) {
      const newCar = carRepository.create(carData);
      await carRepository.save(newCar);

      const carItems = carItemsData.map((itemData) => {
        const carItem = carItemRepository.create({
          ...itemData,
          car: newCar,
        });
        return carItem;
      });

      await carItemRepository.save(carItems);
    }
  }
}
