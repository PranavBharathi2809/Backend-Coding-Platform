import { Injectable } from '@nestjs/common';
import { RunCodeDto } from './dto/run-code.dto';
import { LANGUAGE_CONFIG } from '../utils/language-config';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { spawn } from 'child_process';
import { v4 as uuid } from 'uuid';

@Injectable()
export class ExecuteService {
  async runCode({ language, code, input = '' }: RunCodeDto) {
    const config = LANGUAGE_CONFIG[language];
    if (!config) return { error: 'Unsupported language' };

    // File naming logic
    const filename = path.join(
      os.tmpdir(),
      language === 'java' ? 'Main.java' : `${uuid()}${config.extension}`
    );
    fs.writeFileSync(filename, code);

    const dockerFilePath = `/app/${path.basename(filename)}`;
    const dockerCommand = `docker run --rm -i -m 256m --cpus=0.5 -v "${filename}:${dockerFilePath}" -w /app ${config.image} sh -c "${config.command(dockerFilePath)}"`;

    try {
      const result = await this.runWithInput(dockerCommand, input);

      // Clean up source file
      if (fs.existsSync(filename)) fs.unlinkSync(filename);

      // Java: also remove compiled class
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

      // Always append a newline to simulate Enter key
      child.stdin.write(input + '\n');
      child.stdin.end();
    });
  }
}
