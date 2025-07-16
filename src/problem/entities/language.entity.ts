// src/problem/entities/language.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('languages')
export class Language {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // e.g., 'python', 'javascript'

  @Column({ nullable: true })
  version: string; // e.g., '3.10.4'
}
