import 'dotenv/config';
import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { MainSeeder } from './seeds/MainSeeder';
const PORT_DB = process.env.MYSQL_PORT as number | undefined;

const options: DataSourceOptions & SeederOptions = {
  type: 'mysql',
  host: process.env.MYSQL_HOST,
  port: PORT_DB,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  synchronize: false,
  logging: true,
  migrations: ['src/infra/migrations/*.ts'],
  entities: ['src/domain/entities/*.ts'],
  seeds: [MainSeeder],
};

export const AppDataSource = new DataSource(options);
