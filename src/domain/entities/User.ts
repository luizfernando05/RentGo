import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string | null;

  @Column({ type: 'varchar', length: 50 })
  full_name: string | null;

  @Column({ type: 'varchar', length: 100 })
  email: string | null;

  @Column({ type: 'varchar', length: 200 })
  password: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  constructor() {
    if (!this.id) {
      this.id = uuid();
    }
  }
}

export default User;
