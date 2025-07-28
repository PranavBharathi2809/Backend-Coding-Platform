export class ValidateCodeDto {
  userId: string;
  languageId: number;
  language: 'python' | 'javascript' | 'c' | 'cpp' | 'java';
  userCode: string;
  problemKey: string;
}
