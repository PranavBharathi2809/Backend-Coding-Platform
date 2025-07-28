import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Submission {
  @PrimaryGeneratedColumn('uuid' )
  id: string;

  @Column({type: 'uuid'})
  userId: string;


  @Column()
  problemKey: string;

  @Column()
  languageId: number;

  @Column({ type: 'text' })
  code: string;

  @Column({ type: 'text', nullable: true })
  output: string;

  @Column()
  status: string; // "Accepted", "Wrong Answer", "Error", etc.

  @Column({ type: 'jsonb' })
  testResults: any; // array of input/output/expected

  @CreateDateColumn()
  createdAt: Date;
}
