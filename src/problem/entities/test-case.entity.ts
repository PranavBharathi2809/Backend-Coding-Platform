// src/problem/entities/test-case.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('test_cases')
export class TestCase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  problemId: number;

  @Column('text')
  input: string;

  @Column('text', { name: 'expected_output' })
  expectedOutput: string;

  @Column({ default: false })
  isHidden: boolean;
}
