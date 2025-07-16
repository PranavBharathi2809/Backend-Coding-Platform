// src/problem/entities/function-signature.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('function_signatures')
export class FunctionSignature {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  problemId: number;

  @Column()
  languageId: number;

  @Column('text')
  signature: string;
}
