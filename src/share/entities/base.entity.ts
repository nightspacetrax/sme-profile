import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { v4 as uuidv4 } from 'uuid';

export class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'char', length: 36, unique: true })
  uuid: string;

  @Column()
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ default: null })
  created_by: number;

  @Column({ default: null })
  updated_by: number;

  @BeforeInsert()
  generateUUID() {
    console.log(this.uuid);
    if (!this.uuid) {
      this.uuid = uuidv4();
    }
  }
}
