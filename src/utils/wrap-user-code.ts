interface WrapOptions {
  language: string;
  userCode: string;
  signature: string;      // full signature with opening { or :
  functionName: string;   // name only, for invoking the function
  testCases: { input: string }[];
}

function extractParams(signature: string): string[] {
  const start = signature.indexOf('(');
  const end = signature.indexOf(')');
  if (start === -1 || end === -1 || start > end) return [];

  const paramStr = signature.slice(start + 1, end).trim();
  if (!paramStr) return [];

  return paramStr
    .split(',')
    .map(p => p.trim().split(' ').filter(Boolean).pop()!) // get param name
    .filter(Boolean);
}

export function wrapUserCode({
  language,
  userCode,
  signature,
  functionName,
  testCases,
}: WrapOptions): string {
  const params = extractParams(signature);
  const paramCount = params.length;
  const argsStr = params.join(', ');

  switch (language) {
    case 'python':
      return `
${signature}
${userCode}

if __name__ == "__main__":
    input_values = input().split()
    args = list(map(int, input_values))
    print(${functionName}(*args))
`.trim();

    case 'javascript':
      return `
${signature}
${userCode}
}

let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  const args = input.trim().split(' ').map(Number);
  console.log(${functionName}(...args));
});
`.trim();

    case 'c':
      const cScanfs = params.map(p => `&${p}`).join(', ');
      const cDecl = params.map(p => `int ${p};`).join(' ');
      return `
#include <stdio.h>

${signature}
${userCode}
}

int main() {
    ${cDecl}
    scanf("${'%d '.repeat(paramCount).trim()}", ${cScanfs});
    printf("%d\\n", ${functionName}(${argsStr}));
    return 0;
}
`.trim();

    case 'cpp':
      const cppDecl = params.map(p => `int ${p};`).join(' ');
      const cppInput = params.map(p => `cin >> ${p};`).join(' ');
      return `
#include <iostream>
using namespace std;

${signature}
${userCode}
}

int main() {
    ${cppDecl}
    ${cppInput}
    cout << ${functionName}(${argsStr}) << endl;
    return 0;
}
`.trim();

    case 'java':
      const javaInput = params.map(p => `int ${p} = sc.nextInt();`).join('\n        ');
      return `
import java.util.Scanner;

public class Main {
    ${signature}
    ${userCode}
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        ${javaInput}
        System.out.println(${functionName}(${argsStr}));
    }
}
`.trim();

    default:
      return userCode;
  }
}
