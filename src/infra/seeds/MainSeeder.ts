import { DataSource } from 'typeorm';
import { runSeeder, Seeder, SeederFactoryManager } from 'typeorm-extension';
import { UserSeeder } from './UserSeeder';
import { ClientSeeder } from './ClientSeeder';
import { CarSeeder } from './CarSeeder';
import { OrderSeeder } from './OrderSeeder';

export class MainSeeder implements Seeder {
  track?: boolean | undefined;
  async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<void> {
    await runSeeder(dataSource, UserSeeder);
    await runSeeder(dataSource, ClientSeeder);
    await runSeeder(dataSource, CarSeeder);
    await runSeeder(dataSource, OrderSeeder);
  }
}
