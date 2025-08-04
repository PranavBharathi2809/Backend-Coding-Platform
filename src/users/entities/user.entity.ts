import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Submission } from '../../problem/entities/submission.entity';
import { Job } from 'src/Jobs/entities/job.entity';
import { Role } from './role.entity';
import { Problem } from 'src/problem/entities/problem.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column()
  hashedpassword: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: 'active' | 'inactive';

  // This create a FIELD and make FOREIGN KEY and Reverse mapping also
  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @OneToMany(() => Problem, (problem) => problem.createdBy)
   problems: Problem[];


  @CreateDateColumn()
  createdAt: Date;

   @UpdateDateColumn({ name: 'modified_at' })
  modifiedAt: Date;

 @OneToMany(() => Job, (job) => job.createdBy)
  job: Job[];
}
