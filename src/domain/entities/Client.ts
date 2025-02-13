import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Order } from './Order';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string | null;

  @Column({ type: 'varchar', length: 50 })
  name: string | null;

  @Column({ type: 'date' })
  birthday: Date | null;

  @Column({ type: 'varchar', length: 15, unique: true })
  cpf: string | null;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string | null;

  @Column({ type: 'varchar', length: 15 })
  phone: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToMany(() => Order, (order) => order.client)
  orders: Order[];
}

export default Client;
