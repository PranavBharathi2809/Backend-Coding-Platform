// src/problem/entities/problem.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('problems')
export class Problem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type:'varchar' ,unique: true })
  key: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;
  
}
