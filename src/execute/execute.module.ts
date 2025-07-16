import { Module } from '@nestjs/common';
import { ExecuteController } from './execute.controller';
import { ExecuteService } from './execute.service';
import { ProblemModule } from 'src/problem/problem.module';
@Module({
  imports:[ ProblemModule],
  controllers: [ExecuteController],
  providers: [ExecuteService],
})
export class ExecuteModule {}