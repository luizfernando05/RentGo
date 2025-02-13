import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Client } from './Client';
import { Car } from './Car';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Car)
  @JoinColumn({ name: 'car_id' })
  car: Car;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({
    type: 'enum',
    enum: ['Aberto', 'Aprovado', 'Cancelado'],
    default: 'Aberto',
  })
  status: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  cep: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 2, nullable: true })
  state: string | null;

  @Column({
    name: 'total_value',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalValue: number;

  @Column({ name: 'created_at', type: 'timestamp' })
  initialDate: Date;

  @Column({ name: 'final_date', type: 'timestamp', nullable: true })
  finalDate: Date | null;

  @Column({ name: 'cancellation_date', type: 'timestamp', nullable: true })
  cancellationDate: Date | null;
}
