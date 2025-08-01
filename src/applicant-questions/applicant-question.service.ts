import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Applicant } from 'src/evaluation/entities/applicants.entity';
import { Problem } from 'src/problem/entities/problem.entity';
import { ApplicantQuestion } from './entities/applicant_questions.entity';
import { TestAttempt } from 'src/evaluation/entities/test-attempt.entity';
import { FunctionSignature } from 'src/problem/entities/function-signature.entity';

@Injectable()
export class ApplicantQuestionService {
  constructor(
    @InjectRepository(Applicant)
    private readonly applicantRepo: Repository<Applicant>,

    @InjectRepository(Problem)
    private readonly problemRepo: Repository<Problem>,

    @InjectRepository(ApplicantQuestion)
    private readonly applicantQuestionRepo: Repository<ApplicantQuestion>,

    @InjectRepository(TestAttempt)
    private readonly testAttemptRepo: Repository<TestAttempt>,


  ) { }

  async assignProblem(applicantId: string, attemptId: string): Promise<any> {
    const applicant = await this.applicantRepo.findOne({
      where: { id: applicantId },
      relations: ['experience_level'],
    });

    if (!applicant) {
      throw new NotFoundException('Applicant not found');
    }

    const experienceYears = applicant.experience_level?.max_year ?? 0;

    let difficulty: 'easy' | 'medium' | 'hard';
    if (experienceYears <= 2) difficulty = 'easy';
    else if (experienceYears <= 5) difficulty = 'medium';
    else difficulty = 'hard';

    const problems = await this.problemRepo.find({
      where: { difficulty },
      relations: ['functionSignatures', 'functionNames', 'testCases'],
    });

    if (!problems.length) {
      throw new NotFoundException(`No problems found for difficulty: ${difficulty}`);
    }

    const selected = problems[Math.floor(Math.random() * problems.length)];

    const attempt = await this.testAttemptRepo.findOneByOrFail({ id: attemptId });
    const problem = await this.problemRepo.findOneByOrFail({ id: selected.id });

    const applicantQuestion = this.applicantQuestionRepo.create({
      applicant,
      test_attempt: attempt,
      problem,
      status: 'not_visited',
    });

    await this.applicantQuestionRepo.save(applicantQuestion);
     

    return {
      message: 'Problem assigned',
      problemKey: selected.key,
      title: selected.title,
      description: selected.description,
    };
  }

 async getAssignedProblem(
  applicantId: string,
  attemptId: string,
  languageId: number,
): Promise<any> {
  const record = await this.applicantQuestionRepo.findOne({
    where: {
      applicant: { id: applicantId },
      test_attempt: { id: attemptId },
    },
    relations: [
      'problem',
      'problem.functionSignatures',
      'problem.functionSignatures.language',
      'problem.functionNames',
      'problem.functionNames.language',
      'problem.testCases',
    ],
  });

  if (!record) {
    throw new NotFoundException('Problem not assigned yet for this applicant and attempt');
  }

  const problem = record.problem;

  // Debug logs
  console.log('Fetched functionSignatures:', problem.functionSignatures);
  console.log('Fetched functionNames:', problem.functionNames);
  console.log('Selected languageId:', languageId);

  const selectedSignature = problem.functionSignatures.find(
    (fs) => fs.language && fs.language.id === languageId,
  );

  const selectedFunctionName = problem.functionNames.find(
    (fn) => fn.language && fn.language.id === languageId,
  );

  console.log('Selected signature:', selectedSignature?.signature);
  console.log('Selected function name:', selectedFunctionName?.name);

  return {
    problemKey: problem.key,
    title: problem.title,
    description: problem.description,
    difficulty: problem.difficulty,
    functionSignature: selectedSignature?.signature ?? 'Signature not found',
    functionName: selectedFunctionName?.name ?? 'Function name not found',
    testCases: problem.testCases.map((tc) => ({
      input: tc.input,
      expectedOutput: tc.expectedOutput,
      isHidden: tc.isHidden,
    })),
  };
}


}
