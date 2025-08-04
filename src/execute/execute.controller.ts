import { Body, Controller, Post } from '@nestjs/common';
import { ExecuteService } from './execute.service';
import { RunCodeDto } from './dto/run-code.dto';
import { ValidateCodeDto } from './dto/validate-code.dto';
import { SubmissionService } from 'src/submissions/submission.service';
@Controller()
export class ExecuteController {
  constructor(private readonly executeService: ExecuteService,
    private readonly submissionService: SubmissionService
  ) {}

  @Post('run-code')
  async runCode(@Body() body: RunCodeDto) {
    return this.executeService.runCode(body);
  }


  @Post('validate')
async validateCode(@Body() dto: ValidateCodeDto) {
  return this.executeService.validateSubmission(dto);
}

@Post('submit') // final submission or auto-submission, with DB write
submit(@Body() dto: ValidateCodeDto & { applicantId: string; languageId: number; isAutoSubmitted?: boolean }) {
  return this.executeService.submitCode(dto);

}
}