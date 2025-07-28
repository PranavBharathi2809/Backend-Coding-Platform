export class RunCodeDto {
  language: 'python' | 'javascript' | 'c' | 'cpp' | 'java';
  code: string;
  input?: string;
} 