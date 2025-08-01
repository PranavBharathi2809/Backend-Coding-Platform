import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicantQuestionController } from './applicant-question.controller';
import { ApplicantQuestionService } from './applicant-question.service';
import { ApplicantQuestion } from './entities/applicant_questions.entity';
import { Applicant } from 'src/evaluation/entities/applicants.entity';
import { Problem } from 'src/problem/entities/problem.entity';
import { TestAttempt } from 'src/evaluation/entities/test-attempt.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Applicant, Problem, ApplicantQuestion, TestAttempt]),
  ],
  controllers: [ApplicantQuestionController],
  providers: [ApplicantQuestionService],
})
export class ApplicantQuestionModule {}
