import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Order } from '../../domain/entities/Order';
import { Client } from '../../domain/entities/Client';
import { Car } from '../../domain/entities/Car';

export class OrderSeeder implements Seeder {
  track?: boolean | undefined;

  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<void> {
    const orderRepository = dataSource.getRepository(Order);
    const clientRepository = dataSource.getRepository(Client);
    const carRepository = dataSource.getRepository(Car);

    const client = await clientRepository.findOne({ where: {} });
    const car = await carRepository.findOne({ where: {} });

    if (!client || !car) {
      console.error(
        'É necessário ter pelo menos um cliente e um carro no banco de dados.'
      );
      return;
    }

    const orderData = {
      client: client,
      car: car,
      status: 'Aberto',
      cep: '59650-000',
      city: 'Assú',
      state: 'RN',
      totalValue: 50000.0,
      finalDate: null,
      cancellationDate: null,
    };

    const orderExists = await orderRepository.findOne({
      where: { client: client, car: car },
    });

    if (!orderExists) {
      const newOrder = orderRepository.create(orderData);
      await orderRepository.save(newOrder);
    }
  }
}
