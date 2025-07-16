import { Body, Controller, Post } from '@nestjs/common';
import { ExecuteService } from './execute.service';
import { RunCodeDto } from './dto/run-code.dto';
import { ValidateCodeDto } from './dto/validate-code.dto';
@Controller()
export class ExecuteController {
  constructor(private readonly executeService: ExecuteService) {}

  @Post('run-code')
  async runCode(@Body() body: RunCodeDto) {
    return this.executeService.runCode(body);
  }


  @Post('validate')
async validateCode(@Body() dto: ValidateCodeDto) {
  return this.executeService.validateSubmission(dto);
}

}