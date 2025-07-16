// src/problem/entities/function-name.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('function_names')
export class FunctionName {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  problemId: number;

  @Column()
  languageId: number;

  @Column()
  name: string;
}
