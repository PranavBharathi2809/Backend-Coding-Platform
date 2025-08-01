import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { ApplicantQuestionService } from './applicant-question.service';

@Controller('applicant-question')
export class ApplicantQuestionController {
  constructor(
    private readonly applicantQuestionService: ApplicantQuestionService,
  ) {}

  // @Get('start/:applicantId/:attemptId/:languageId')
  // async startOrFetchProblem(
  //   @Query('applicantId') applicantId: string,
  //   @Query('attemptId') attemptId: string,
  //   @Query('languageId') languageId: number,
  // ) {
  //   // Check if problem already assigned
  //   try {
  //     const fetched = await this.applicantQuestionService.getAssignedProblem(
  //       applicantId,
  //       attemptId,
  //       languageId,
  //     );
  //     return { status: 'already_assigned', ...fetched };
  //   } catch (error) {
  //     if (error.status === 404) {
  //       // If not assigned, assign and return
  //       await this.applicantQuestionService.assignProblem(applicantId, attemptId);
  //       const assigned = await this.applicantQuestionService.getAssignedProblem(
  //         applicantId,
  //         attemptId,
  //         languageId,
  //       );
  //       return { status: 'newly_assigned', ...assigned };
  //     } else {
  //       throw error;
  //     }
  //   }
  // }


  @Get('start/:applicantId/:attemptId/:languageId')
async startOrFetchProblem(
  @Param('applicantId') applicantId: string,
  @Param('attemptId') attemptId: string,
  @Param('languageId') languageIdStr: string,
) {
  const languageId = parseInt(languageIdStr, 10);
  if (isNaN(languageId)) {
    throw new BadRequestException('languageId must be a number');
  }

  try {
    const fetched = await this.applicantQuestionService.getAssignedProblem(
      applicantId,
      attemptId,
      languageId,
    );
    return { status: 'already_assigned', ...fetched };
  } catch (error) {
    if (error.status === 404) {
      await this.applicantQuestionService.assignProblem(applicantId, attemptId);
      const assigned = await this.applicantQuestionService.getAssignedProblem(
        applicantId,
        attemptId,
        languageId,
      );
      return { status: 'newly_assigned', ...assigned };
    } else {
      throw error;
    }
  }
}

}
