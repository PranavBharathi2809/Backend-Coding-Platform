// src/problem/entities/problem.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { OneToMany } from 'typeorm';
import { FunctionSignature } from './function-signature.entity';
import { FunctionName } from './function-name.entity';
import { TestCase } from './test-case.entity';



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

   @OneToMany(() => FunctionSignature, (fs) => fs.problem)
  functionSignatures: FunctionSignature[];

  // ✅ Add this
  @OneToMany(() => FunctionName, (fn) => fn.problem)
  functionNames: FunctionName[];

  // ✅ Already likely present, but make sure
  @OneToMany(() => TestCase, (tc) => tc.problem)
  testCases: TestCase[];
}
  

