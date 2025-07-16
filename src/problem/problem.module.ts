import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Problem } from './entities/problem.entity';
import { FunctionSignature } from './entities/function-signature.entity';
import { FunctionName } from './entities/function-name.entity';
import { TestCase } from './entities/test-case.entity';
import { ProblemService } from './problem.service';
import { Language } from './entities/language.entity';
import { ProblemController } from './problem.controller';



@Module({
  imports: [
    TypeOrmModule.forFeature([Problem, Language,FunctionSignature, FunctionName, TestCase])
  ],
  providers: [ProblemService],
  controllers: [ProblemController],
  exports: [ProblemService], // ✅ so you can use it in other modules like ExecuteModule
})
export class ProblemModule {}
