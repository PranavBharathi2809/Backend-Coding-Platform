import { Body, Controller, Post } from '@nestjs/common';
import { ExecuteService } from './execute.service';
import { RunCodeDto } from './dto/run-code.dto';

@Controller()
export class ExecuteController {
  constructor(private readonly executeService: ExecuteService) {}

  @Post('run-code')
  async runCode(@Body() body: RunCodeDto) {
    return this.executeService.runCode(body);
  }
}
