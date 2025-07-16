export class ValidateCodeDto {
  language: 'python' | 'javascript' | 'c' | 'cpp' | 'java';
  userCode: string;
  problemKey: string;
}
