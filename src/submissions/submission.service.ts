import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from 'src/problem/entities/submission.entity';
import { CreateSubmissionDto } from 'src/execute/dto/submission.dto';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,
  ) {}

  async create(dto: CreateSubmissionDto): Promise<Submission> {
    const submission = this.submissionRepo.create(dto);
    return await this.submissionRepo.save(submission);
  }

  async getAllByUser(userId: string): Promise<Submission[]> {
    return this.submissionRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllByProblem(problemKey: string): Promise<Submission[]> {
    return this.submissionRepo.find({
      where: { problemKey },
      order: { createdAt: 'DESC' },
    });
  }
}
