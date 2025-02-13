import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import CarItem from './CarItem';
import { Order } from './Order';

@Entity('car')
export class Car {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 7 })
  plate: string;

  @Column({ type: 'varchar', length: 127 })
  brand: string;

  @Column({ type: 'varchar', length: 127 })
  model: string;

  @Column({ type: 'int' })
  km: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 8 })
  status: string;

  @OneToMany(() => CarItem, (item) => item.car, {
    cascade: ['insert', 'update'],
  })
  items: CarItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToMany(() => Order, (order) => order.car)
  orders: Order[];
}

export default Car;
