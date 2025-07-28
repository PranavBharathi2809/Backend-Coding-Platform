import { Injectable } from '@nestjs/common';
import { RunCodeDto } from './dto/run-code.dto';
import { LANGUAGE_CONFIG } from '../utils/language-config';
import { ProblemService } from '../problem/problem.service';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { spawn } from 'child_process';
import { v4 as uuid } from 'uuid';
import { wrapUserCode } from '../utils/wrap-user-code';
import { TestResult } from './dto/test-result.interface'
import { SubmissionService } from 'src/submissions/submission.service';

@Injectable()
export class ExecuteService {
  constructor(
     private readonly problemService: ProblemService,
     private readonly submissionService: SubmissionService
  ) {}

  async runCode({ language, code, input = '' }: RunCodeDto) {
    const config = LANGUAGE_CONFIG[language];
    if (!config) return { error: 'Unsupported language' };

    const filename = path.join(
      os.tmpdir(),
      language === 'java' ? 'Main.java' : `${uuid()}${config.extension}`
    );
    fs.writeFileSync(filename, code);

    const dockerFilePath = `/app/${path.basename(filename)}`;
    const dockerCommand = `docker run --rm -i -m 256m --cpus=0.5 -v "${filename}:${dockerFilePath}" -w /app ${config.image} sh -c "${config.command(dockerFilePath)}"`;

    try {
      const result = await this.runWithInput(dockerCommand, input);

      if (fs.existsSync(filename)) fs.unlinkSync(filename);
      if (language === 'java') {
        const classFile = path.join(os.tmpdir(), 'Main.class');
        if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
      }

      return result;
    } catch (err: any) {
      if (fs.existsSync(filename)) fs.unlinkSync(filename);
      return {
        stdout: '',
        stderr: err.message || 'Unknown error',
        exitCode: 1,
      };
    }
  }

  private runWithInput(command: string, input: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve) => {
      const child = spawn(command, { shell: true });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => (stdout += data.toString()));
      child.stderr.on('data', (data) => (stderr += data.toString()));

      child.on('close', (code) => {
        resolve({
          stdout,
          stderr,
          exitCode: code ?? 1,
        });
      });

      child.stdin.write(input + '\n');
      child.stdin.end();
    });
  }

  // ✅ New method: validateSubmission
  async validateSubmission({
  
  problemKey,
  language,
  userCode,
}: {
  
  problemKey: string;
  language: 'python' | 'javascript' | 'c' | 'cpp' | 'java';
  userCode: string;
}) {
  // Fetch problem with all required relations
  const problem = await this.problemService.getProblemForExecution(problemKey, language);

  if (!problem) {
    return { status: 'error', error: 'Problem not found' };
  }

  const { title, signature, functionName, testCases } = problem;

  if (!signature || !functionName) {
    return { status: 'error', error: 'Signature or function name not found' };
  }

  const results: TestResult[] = [];

  for (const testCase of testCases) {
    const wrappedCode = wrapUserCode({
      language,
      userCode,
      signature,
      functionName,
      testCases,
    });

    const executionResult = await this.runCode({
      language,
      code: wrappedCode,
      input: testCase.input,
    });

    if ('error' in executionResult) {
      results.push({
        input: testCase.input,
        expected: testCase.expectedOutput.trim(),
        actual: '',
        passed: false,
        stderr: executionResult.stderr || '',
      });
    } else {
      results.push({
        input: testCase.input,
        expected: testCase.expectedOutput.trim(),
        actual: executionResult.stdout.trim(),
        passed: executionResult.stdout.trim() === testCase.expectedOutput.trim(),
        stderr: executionResult.stderr,
      });
    }
  }

  const passedCount = results.filter(r => r.passed).length;
 const status = passedCount === results.length ? 'Passed' : 'failed';

  return {
    status: passedCount === results.length ? 'Passed' : 'Failed',
    total: results.length,
    passed: passedCount,
    output: results.map(r => r.actual).join('\n'),
    testResults: results,
  };



}
  async submitCode({
  userId,
  problemKey,
  userCode,
  language,
  languageId,
  isAutoSubmitted = false,
}: {
  userId: string;
  problemKey: string;
  userCode: string;
  language: 'python' | 'javascript' | 'c' | 'cpp' | 'java';
  languageId: number;
  isAutoSubmitted?: boolean;
}) {
  const result = await this.validateSubmission({ userCode, problemKey, language });

  if ('error' in result) return result;

  await this.submissionService.create({
    userId,
    problemKey,
    languageId,
    code: userCode,
    output: result.output,
    testResults: result.testResults,
    status: result.status,
    isAutoSubmitted,
    
  });

  return { ...result, submitted: true };
}

}
