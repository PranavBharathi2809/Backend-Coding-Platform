import { Skill } from 'src/skills/entities/skill.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ExperienceLevel } from './experience_levels.entity';

@Entity('applicant')
export class Applicant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @ManyToOne(() => ExperienceLevel)
  @JoinColumn({ name: 'experience_level_id' })
  experience_level: ExperienceLevel;

  @ManyToOne(() => Skill)
  @JoinColumn({ name: 'primary_skill_id' })
  primary_skill: Skill;

  @ManyToOne(() => Skill)
  @JoinColumn({ name: 'secondary_skill_id' })
  secondary_skill: Skill;
}