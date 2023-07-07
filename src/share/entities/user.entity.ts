import { Column, Entity, Generated, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'user', synchronize: true })
export class User extends BaseEntity {
  @Column({ default: null, length: 50 })
  user_name: string;

  @Column({ default: null, length: 255 })
  password: string;
}
