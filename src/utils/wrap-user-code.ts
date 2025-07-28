interface WrapOptions {
  language: string;
  userCode: string;
  signature: string;
  functionName: string;
  testCases: { input: string }[];
}

// ✅ Extract parameter types from function signature
function extractParams(signature: string): { type: string; name: string }[] {
  const start = signature.indexOf('(');
  const end = signature.indexOf(')');
  if (start === -1 || end === -1 || start > end) return [];
  const paramStr = signature.slice(start + 1, end).trim();
  if (!paramStr) return [];

  return paramStr.split(',').map(param => {
    const cleaned = param.trim();
    const match = cleaned.match(/^(.+?)\s+(\w+)$/);

    if (match) {
      let [, type, name] = match;
      type = type.replace(/\s+/g, ''); // Remove any spaces in type like "int []"

      // Normalize types with a clear priority
      if (type.includes('int[][]') || type.includes('int**') || type.includes('vector<vector<int>>')) {
        type = 'int[][]';
      } else if (type.includes('int[]') || type.includes('vector<int>')) {
        type = 'int[]';
      } else if (type.includes('string[][]') || type.includes('vector<vector<string>>')) {
        type = 'string[][]';
      } else if (type.includes('string[]') || type.includes('vector<string>')) {
        type = 'string[]';
      } else if (type.includes('int')) {
        type = 'int';
      } else if (type.includes('float') || type.includes('double')) {
        type = 'float';
      } else if (type.includes('bool') || type.includes('boolean')) {
        type = 'bool';
      } else if (type.includes('string') || type.includes('String')) {
        type = 'string';
      }
      return { type, name };
    }

    // Fallback for types not explicitly declared (e.g., just "nums" as a param)
    if (/^\w+$/.test(cleaned)) {
      const name = cleaned;
      if (/matrix|grid|data/i.test(name)) return { type: 'int[][]', name };
      if (/nums|arr|list/i.test(name)) return { type: 'int[]', name };
      if (/words|strings/i.test(name)) return { type: 'string[]', name };
      return { type: 'int', name }; // Default scalar type
    }
    return { type: 'unknown', name: 'param' };
  }).filter(p => p.name);
}

// ✅ Python indentation helper
function indentPython(code: string, spaces = 4): string {
  return code
    .split('\n')
    .map(line => ' '.repeat(spaces) + line)
    .join('\n');
}

// ✅ Main Wrapper Function
export function wrapUserCode({
  language,
  userCode,
  signature,
  functionName,
  testCases,
}: WrapOptions): string {
  const params = extractParams(signature);
  const argsStr = params.map(p => p.name).join(', ');
  console.log(">> Params:", params);

  switch (language.toLowerCase()) {

case 'python': {
  function extractParamsforPython(signature: string): { name: string; type: string }[] {
  const start = signature.indexOf('(');
  const end = signature.indexOf(')');
  if (start === -1 || end === -1 || start > end) return [];

  const paramStr = signature.slice(start + 1, end).trim();
  if (!paramStr) return [];

  return paramStr.split(',').map(param => {
    const [name, type] = param.split(':').map(s => s.trim());
    return {
      name: name || 'param',
      type: type || 'unknown'
    };
  });
}
 const paramsforPython = extractParamsforPython(signature);
  const paramNames = paramsforPython.map(p => p.name).join(', ');
  console.log(">> paramNames:", paramNames);
  // Indent user code properly
  const indentPython = (code: string) =>
    code
      .split('\n')
      .map(line => '    ' + line)
      .join('\n');

  const fullFunction = `def ${functionName}(${paramNames}):\n${indentPython(userCode)}`;

  const pyInputParser = (() => {
    let parser = '    flat = re.split(r"[\\s,]+", lines[0].strip())\n';
    let idx = 0;

    for (const { type, name } of paramsforPython) {
      if (type === 'int') {
        parser += `    ${name} = int(flat[${idx}])\n`;
        idx++;
      } else if (type === 'float' || type === 'double') {
        parser += `    ${name} = float(flat[${idx}])\n`;
        idx++;
      } else if (type === 'bool') {
        parser += `    ${name} = flat[${idx}].lower() in ('true', '1')\n`;
        idx++;
      } else if (type === 'string') {
        parser += `    ${name} = flat[${idx}]\n`;
        idx++;
      } else if (type === 'int[]') {
        parser += `    ${name} = list(map(int, re.split(r"[\\s,]+", lines[${idx}].strip())))\n`;
        idx++;
      } else if (type === 'float[]' || type === 'double[]') {
        parser += `    ${name} = list(map(float, re.split(r"[\\s,]+", lines[${idx}].strip())))\n`;
        idx++;
      } else if (type === 'bool[]') {
        parser += `    ${name} = [x.lower() in ('true','1') for x in re.split(r"[\\s,]+", lines[${idx}].strip())]\n`;
        idx++;
      } else if (type === 'string[]') {
        parser += `    ${name} = re.split(r"[\\s,]+", lines[${idx}].strip())\n`;
        idx++;
      } else if (type === 'int[][]') {
        parser += `    ${name} = [list(map(int, re.split(r"[\\s,]+", row.strip()))) for row in lines[${idx}].strip().split(';') if row.strip()]\n`;
        idx++;
      } else if (type === 'float[][]' || type === 'double[][]') {
        parser += `    ${name} = [list(map(float, re.split(r"[\\s,]+", row.strip()))) for row in lines[${idx}].strip().split(';') if row.strip()]\n`;
        idx++;
      } else if (type === 'bool[][]') {
        parser += `    ${name} = [[x.lower() in ('true','1') for x in re.split(r"[\\s,]+", row.strip())] for row in lines[${idx}].strip().split(';') if row.strip()]\n`;
        idx++;
      } else if (type === 'string[][]') {
        parser += `    ${name} = [re.split(r"[\\s,]+", row.strip()) for row in lines[${idx}].strip().split(';') if row.strip()]\n`;
        idx++;
      } 
       else if (type === 'list[list[int]]' || type === 'int[][]') {
       parser += `    ${name} = [list(map(int, re.split(r"[\\s,]+", row.strip()))) for row in lines[${idx}].strip().split(';') if row.strip()]\n`;
      idx++;
      } 
      else if (type.startsWith('list[')) {
          const innerType = type.slice(5, -1).trim();
          if (innerType === 'int') {
            parser += `    ${name} = list(map(int, re.split(r"[\\s,]+", lines[${idx++}].strip())))\n`;
          } else if (innerType === 'float' || innerType === 'double') {
            parser += `    ${name} = list(map(float, re.split(r"[\\s,]+", lines[${idx++}].strip())))\n`;
          } else if (innerType === 'bool') {
            parser += `    ${name} = [x.lower() in ('true','1') for x in re.split(r"[\\s,]+", lines[${idx++}].strip())]\n`;
          } else if (innerType === 'char') {
            parser += `    ${name} = [x[0] for x in re.split(r"[\\s,]+", lines[${idx++}].strip()) if x]\n`;
          } else {
            parser += `    ${name} = re.split(r"[\\s,]+", lines[${idx++}].strip())\n`;  // default string
          }
      }

      else if (type.startsWith('tuple[')) {
        const innerTypes = type.slice(6, -1).split(',').map(t => t.trim());
        const lineRef = `re.split(r"[\\s,]+", lines[${idx++}].strip())`;
        const tupleParts = innerTypes.map((t, i) => {
          if (t === 'int') return `int(${lineRef}[${i}])`;
          if (t === 'float' || t === 'double') return `float(${lineRef}[${i}])`;
          if (t === 'bool') return `${lineRef}[${i}].lower() in ('true','1')`;
          if (t === 'char') return `${lineRef}[${i}][0] if ${lineRef}[${i}] else ''`;
          return `${lineRef}[${i}]`; // string fallback
        });
        parser += `    ${name} = (${tupleParts.join(', ')})\n`;
      }

      else if (type.startsWith('set[')) {
        const innerType = type.slice(4, -1).trim();
        if (innerType === 'int') {
          parser += `    ${name} = set(map(int, re.split(r"[\\s,]+", lines[${idx++}].strip())))\n`;
        } else if (innerType === 'float' || innerType === 'double') {
          parser += `    ${name} = set(map(float, re.split(r"[\\s,]+", lines[${idx++}].strip())))\n`;
        } else if (innerType === 'bool') {
          parser += `    ${name} = set(x.lower() in ('true','1') for x in re.split(r"[\\s,]+", lines[${idx++}].strip()))\n`;
        } else if (innerType === 'char') {
          parser += `    ${name} = set(x[0] for x in re.split(r"[\\s,]+", lines[${idx++}].strip()) if x)\n`;
        } else {
          parser += `    ${name} = set(re.split(r"[\\s,]+", lines[${idx++}].strip()))\n`; // default string
        }
      }

      else if (type.startsWith('dict[') || type.startsWith('map[')) {
        const content = type.slice(type.indexOf('[') + 1, -1).split(',');
        const keyType = content[0]?.trim();
        const valueType = content[1]?.trim();

        const keyCast = keyType === 'int' ? 'int' :
                        keyType === 'float' || keyType === 'double' ? 'float' :
                        keyType === 'bool' ? `(lambda x: x.lower() in ('true','1'))` :
                        keyType === 'char' ? '(lambda x: x[0])' :
                        'str';

        const valCast = valueType === 'int' ? 'int' :
                        valueType === 'float' || valueType === 'double' ? 'float' :
                        valueType === 'bool' ? `(lambda x: x.lower() in ('true','1'))` :
                        valueType === 'char' ? '(lambda x: x[0])' :
                        'str';

        parser += `    ${name} = dict((${keyCast}(k), ${valCast}(v)) for k,v in [item.split(':') for item in lines[${idx++}].strip().split(',') if ':' in item])\n`;
      }

      else {
        parser += `    # Unsupported type for ${name}\n`;
      }
    }

    return parser;
  })();

  return `
import re
import sys

${fullFunction}

if __name__ == "__main__":
    lines = sys.stdin.read().strip().split("\\n")
${pyInputParser}
    print(${functionName}(${paramNames}))
  `.trim();
}



    case 'javascript': {
  const jsInputParser = (() => {
    const lineSplitCode = `const values = line.trim().split(/\\s+/);`;
    let index = 0;
    const extractors = params.map(({ type, name }) => {
      if (type === 'int') return `const ${name} = parseInt(values[${index++}]);`;
      if (type === 'float' || type === 'double') return `const ${name} = parseFloat(values[${index++}]);`;
      if (type === 'boolean') return `const ${name} = values[${index++}].toLowerCase() === 'true';`;
      if (type === 'string') return `const ${name} = values[${index++}];`;
      // Don't touch array/matrix logic
      if (type === 'int[]') return `const ${name} = line.trim().split(/\\s+/).map(Number);`;
      if (type === 'float[]' || type === 'double[]') return `const ${name} = line.trim().split(/\\s+/).map(parseFloat);`;
      if (type === 'string[]') return `const ${name} = line.trim().split(/\\s+/);`;
      if (type === 'int[][]') return `const ${name} = line.trim().split(';').map(row => row.split(/\\s+|,/).map(Number));`;
      if (type === 'string[][]') return `const ${name} = line.trim().split(';').map(row => row.split(/\\s+|,/));`;
      return `// Unsupported type for ${name}`;
    });
    return [lineSplitCode, ...extractors].join('\n        ');
  })();

  const argsStr = params.map(p => p.name).join(', ');

  return `
function ${functionName}(${argsStr}) {
${userCode}
}
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  const lines = input.trim().split(/\\r?\\n/).filter(Boolean);
  lines.forEach(line => {
    ${jsInputParser}
    console.log(${functionName}(${argsStr}));
  });
});
  `.trim();
}


    case 'java': {
      const javaInput = params.map(({ type, name }) => {
        const uniqueNameSuffix = name.charAt(0).toUpperCase() + name.slice(1);

        if (type === 'int') return `int ${name} = Integer.parseInt(sc.nextLine().trim());`;
        if (type === 'String') return `String ${name} = sc.nextLine().trim();`;
        if (type === 'int[]') return `
String line${uniqueNameSuffix};
do {
    line${uniqueNameSuffix} = sc.nextLine().trim();
} while (line${uniqueNameSuffix}.isEmpty());
int[] ${name} = Arrays.stream(line${uniqueNameSuffix}.split("[,\\s]+")).mapToInt(Integer::parseInt).toArray();`.trim();
        if (type === 'String[]') return `
String line${uniqueNameSuffix};
do {
    line${uniqueNameSuffix} = sc.nextLine().trim();
} while (line${uniqueNameSuffix}.isEmpty());
String[] ${name} = line${uniqueNameSuffix}.split("[,\\s]+");`.trim();
        if (type === 'int[][]') return `
String matrixLine${uniqueNameSuffix};
do {
    matrixLine${uniqueNameSuffix} = sc.nextLine().trim(); // This reads the entire matrix string like "1,2;3,4"
} while (matrixLine${uniqueNameSuffix}.isEmpty());
String[] rows${uniqueNameSuffix} = matrixLine${uniqueNameSuffix}.split(";");
int[][] ${name} = new int[rows${uniqueNameSuffix}.length][];
for (int i = 0; i < rows${uniqueNameSuffix}.length; i++) {
    String[] elements = rows${uniqueNameSuffix}[i].split("[,\\s]+");
    ${name}[i] = new int[elements.length];
    for (int j = 0; j < elements.length; j++) {
        ${name}[i][j] = Integer.parseInt(elements[j]);
    }
}`.trim();
        if (type === 'String[][]') return `
String matrixLine${uniqueNameSuffix};
do {
    matrixLine${uniqueNameSuffix} = sc.nextLine().trim();
} while (matrixLine${uniqueNameSuffix}.isEmpty());
String[] rows${uniqueNameSuffix} = matrixLine${uniqueNameSuffix}.split(";");
String[][] ${name} = new String[rows${uniqueNameSuffix}.length][];
for (int i = 0; i < rows${uniqueNameSuffix}.length; i++) {
    String[] elements = rows${uniqueNameSuffix}[i].split("[,\\s]+");
    ${name}[i] = elements;
}`.trim();
        return `// Unsupported type for ${name}`;
      }).join('\n'); // Changed join to just '\n' for clearer separation

      return `
import java.util.*;
import java.util.stream.*;

public class Main {
    ${signature}
${userCode}
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        ${javaInput}
        sc.close();

        System.out.println(${functionName}(${argsStr}));
    }
}
            `.trim();
    }

case 'c': {
            // Determine the arguments to pass to the user's function in main().
            // For a matrix, it's typically (matrix_ptr, rows, cols).
            // For a 1D array, it's (array_ptr, size).
            const mainFunctionCallArgs = params.map(p => {
                if (p.type === 'int[][]' || p.type === 'float[][]' || p.type === 'double[][]' || p.type === 'string[][]') {
                    return `${p.name}`; // Pass matrix, rows, and cols
                }
                if (p.type === 'int[]' || p.type === 'float[]' || p.type === 'double[]' || p.type === 'string[]') {
                    return `${p.name}, ${p.name}_size`; // Pass array and its size
                }
                return p.name; // For scalar types
            }).join(', ');

            const matrixParam = params.find(p => p.type.endsWith('[][]'));
            const arrayParams = params.filter(p => p.type.endsWith('[]') && !p.type.endsWith('[][]'));
            const scalarParams = params.filter(p => ['int', 'float', 'double', 'string', 'bool'].includes(p.type));

            let inputParsers = `
    // Dynamically read entire input from stdin
    char *raw_input_buffer = NULL;
    size_t raw_input_len = 0;
    char chunk[1024]; // Read in chunks
    while (fgets(chunk, sizeof(chunk), stdin) != NULL) {
        size_t chunk_len = strlen(chunk);
        raw_input_buffer = (char*)realloc(raw_input_buffer, raw_input_len + chunk_len + 1);
        if (raw_input_buffer == NULL) { fprintf(stderr, "Memory allocation failed for input buffer.\\n"); return 1; }
        strcpy(raw_input_buffer + raw_input_len, chunk);
        raw_input_len += chunk_len;
    }
    if (raw_input_len == 0 && raw_input_buffer != NULL) { // Handle case where only a newline was read
        free(raw_input_buffer);
        raw_input_buffer = NULL;
    }

    // Create a mutable copy for tokenization, as strtok modifies the string.
    char *mutable_input_copy = NULL;
    if (raw_input_buffer != NULL) {
        mutable_input_copy = strdup(raw_input_buffer);
        if (mutable_input_copy == NULL) { fprintf(stderr, "Memory allocation failed for mutable input copy.\\n"); return 1; }
        free(raw_input_buffer); // Free the original buffer as we have a duplicate
    } else {
        mutable_input_copy = strdup(""); // Provide an empty string if no input was given
        if (mutable_input_copy == NULL) { fprintf(stderr, "Memory allocation failed for empty string copy.\\n"); return 1; }
    }
    
    // Remove trailing newline/carriage return characters from the end of the input
    mutable_input_copy[strcspn(mutable_input_copy, "\\n\\r")] = 0;
    `;

            // MATRIX Parsing
            if (matrixParam) {
                const base = matrixParam.type.replace('[][]', '');
                const cType = base === 'string' ? 'char*' :
                              base === 'float' ? 'float' :
                              base === 'double' ? 'double' : 'int';

                inputParsers += `
    int rows = 0;
    int cols = 0;

    // Count rows based on semicolons
    char *rows_temp = strdup(mutable_input_copy); // Use a copy for counting rows
    if (rows_temp == NULL) { fprintf(stderr, "Memory allocation failed for row counter.\\n"); return 1; }
    if (strlen(rows_temp) > 0) { // Only count if there's actual content
        for (int i = 0; rows_temp[i]; i++) {
            if (rows_temp[i] == ';') rows++;
        }
        rows++; // The last row doesn't have a trailing semicolon
    } else {
        rows = 0; // No input, so 0 rows
    }
    free(rows_temp);


    ${cType}** ${matrixParam.name} = NULL;
    if (rows > 0) {
        ${matrixParam.name} = (${cType}**)malloc(rows * sizeof(${cType}*));
        if (${matrixParam.name} == NULL) { fprintf(stderr, "Matrix row allocation failed for ${matrixParam.name}.\\n"); return 1; }
    } else {
        // Handle empty matrix or no input scenario
        ${matrixParam.name} = NULL; // Explicitly null for 0 rows
    }
    
    // Tokenize the mutable_input_copy by semicolons for rows
    char *matrix_str_copy_for_rows = strdup(mutable_input_copy);
    if (matrix_str_copy_for_rows == NULL) { fprintf(stderr, "Memory allocation failed for matrix row parsing.\\n"); return 1; }

    char *row_token = strtok(matrix_str_copy_for_rows, ";");
    int current_row_idx = 0;
    while (row_token != NULL && current_row_idx < rows) {
        // Create a mutable copy of the current row string for column tokenization
        char *col_parse_copy = strdup(row_token);
        if (col_parse_copy == NULL) { fprintf(stderr, "Memory allocation failed for column parsing.\\n"); return 1; }
        
        // Replace commas with spaces within the row string
        for (int i = 0; col_parse_copy[i]; i++) {
            if (col_parse_copy[i] == ',') {
                col_parse_copy[i] = ' ';
            }
        }

        // Count columns in the first row to determine 'cols' for the entire matrix
        int current_cols_in_row = 0;
        char *temp_col_counter_copy = strdup(col_parse_copy); // Use a temporary copy for counting
        if (temp_col_counter_copy == NULL) { fprintf(stderr, "Memory allocation failed for column counter.\\n"); return 1; }
        char *count_tok = strtok(temp_col_counter_copy, " ");
        while(count_tok != NULL) {
            if (strlen(count_tok) > 0) current_cols_in_row++; // Only count non-empty tokens
            count_tok = strtok(NULL, " ");
        }
        free(temp_col_counter_copy);

        if (current_row_idx == 0) {
            cols = current_cols_in_row; // Set total columns from the first row
            // If cols is 0 after parsing, this means the first row was empty or malformed.
            // You might want to add error handling or assume a default.
        }

        if (cols == 0) { // If no columns were found (e.g., empty row string), allocate 0 space
            ${matrixParam.name}[current_row_idx] = NULL; // Or handle as appropriate
        } else {
            ${matrixParam.name}[current_row_idx] = (${cType}*)malloc(cols * sizeof(${cType}));
            if (${matrixParam.name}[current_row_idx] == NULL) { fprintf(stderr, "Matrix column allocation failed for row %d.\\n", current_row_idx); return 1; }
        }

        // Tokenize the row string by spaces for individual elements
        char* element_token = strtok(col_parse_copy, " ");
        int current_col_idx = 0;
        while (element_token != NULL && current_col_idx < cols) {
            if (strlen(element_token) > 0) { // Ensure token is not empty
                ${
                    base === 'float' ? `${matrixParam.name}[current_row_idx][current_col_idx++] = strtof(element_token, NULL);` :
                    base === 'double' ? `${matrixParam.name}[current_row_idx][current_col_idx++] = strtod(element_token, NULL);` :
                    base === 'string' ? `${matrixParam.name}[current_row_idx][current_col_idx++] = strdup(element_token);` :
                    `${matrixParam.name}[current_row_idx][current_col_idx++] = atoi(element_token);`
                }
            }
            element_token = strtok(NULL, " ");
        }
        free(col_parse_copy); // Free the copy of the row string
        
        row_token = strtok(NULL, ";");
        current_row_idx++;
    }
    free(matrix_str_copy_for_rows); // Free the copy used for row splitting
    `;
            }

            // ARRAYS (for any 1D array parameters)
            for (const param of arrayParams) {
                const base = param.type.replace('[]', '');
                const name = param.name;
                const cType = base === 'string' ? 'char*' : (base === 'float' ? 'float' : (base === 'double' ? 'double' : 'int'));

                inputParsers += `
    int ${name}_size = 0;
    int ${name}_capacity = 10;
    ${cType}* ${name} = (${cType}*)malloc(${name}_capacity * sizeof(${cType}));
    if (${name} == NULL) { fprintf(stderr, "Array allocation failed for ${name}.\\n"); return 1; }

    char* array_input_copy = strdup(mutable_input_copy); // Use a fresh copy for this array's parsing
    if (array_input_copy == NULL) { fprintf(stderr, "Memory allocation failed for array input copy.\\n"); return 1; }

    // Replace commas with spaces in this copy
    for (int i = 0; array_input_copy[i]; i++) {
        if (array_input_copy[i] == ',') {
            array_input_copy[i] = ' ';
        }
    }

    char* array_token = strtok(array_input_copy, " ");
    while (array_token != NULL) {
        if (strlen(array_token) > 0) { // Only process non-empty tokens
            if (${name}_size == ${name}_capacity) {
                ${name}_capacity *= 2;
                ${cType}* temp_realloc = (${cType}*)realloc(${name}, ${name}_capacity * sizeof(${cType}));
                if (temp_realloc == NULL) { fprintf(stderr, "Array realloc failed for ${name}.\\n"); return 1; }
                ${name} = temp_realloc;
            }
            ${
                base === 'float' ? `${name}[${name}_size++] = strtof(array_token, NULL);` :
                base === 'double' ? `${name}[${name}_size++] = strtod(array_token, NULL);` :
                base === 'string' ? `${name}[${name}_size++] = strdup(array_token);` :
                `${name}[${name}_size++] = atoi(array_token);`
            }
        }
        array_token = strtok(NULL, " ");
    }
    free(array_input_copy); // Free the copy used for this array
    `;
            }

            // SCALARS (only if no arrays or matrices were parsed from the main input line)
            // This logic assumes scalars are space/comma separated on a single line
            if (scalarParams.length > 0 && arrayParams.length === 0 && !matrixParam) {
                inputParsers += `
    char *scalar_input_copy = strdup(mutable_input_copy); // Copy for scalar parsing
    if (scalar_input_copy == NULL) { fprintf(stderr, "Memory allocation failed for scalar input copy.\\n"); return 1; }

    // Replace commas with spaces in this copy
    for (int i = 0; scalar_input_copy[i]; i++) {
        if (scalar_input_copy[i] == ',') {
            scalar_input_copy[i] = ' ';
        }
    }

    char *scalar_token = strtok(scalar_input_copy, " ");
    `;
                for (const p of scalarParams) {
                    inputParsers += `    `; // Indent
                    if (p.type === 'string') {
                        inputParsers += `char ${p.name}[1000]; // Fixed size buffer for string scalar
    if (scalar_token != NULL) { strcpy(${p.name}, scalar_token); scalar_token = strtok(NULL, " "); } else { ${p.name}[0] = '\\0'; } // Handle missing token\n`;
                    } else if (p.type === 'float') {
                        inputParsers += `float ${p.name};\n    if (scalar_token != NULL) { ${p.name} = strtof(scalar_token, NULL); scalar_token = strtok(NULL, " "); } else { ${p.name} = 0.0f; } // Handle missing token\n`;
                    } else if (p.type === 'double') {
                        inputParsers += `double ${p.name};\n    if (scalar_token != NULL) { ${p.name} = strtod(scalar_token, NULL); scalar_token = strtok(NULL, " "); } else { ${p.name} = 0.0; } // Handle missing token\n`;
                    } else if (p.type === 'bool') {
                        inputParsers += `bool ${p.name};\n    if (scalar_token != NULL) { ${p.name} = (strcmp(scalar_token, "true") == 0 || strcmp(scalar_token, "1") == 0); scalar_token = strtok(NULL, " "); } else { ${p.name} = false; } // Handle missing token\n`;
                    } else { // int
                        inputParsers += `int ${p.name};\n    if (scalar_token != NULL) { ${p.name} = atoi(scalar_token); scalar_token = strtok(NULL, " "); } else { ${p.name} = 0; } // Handle missing token\n`;
                    }
                }
                inputParsers += `    free(scalar_input_copy);\n`; // Free scalar copy
            }

            // CLEANUP
            let cleanup = `\n    free(mutable_input_copy);\n`;

            if (matrixParam) {
                cleanup += `
    if (${matrixParam.name} != NULL) {
        for (int i = 0; i < rows; i++) {
            if (${matrixParam.name}[i] != NULL) {
                // If it's a string matrix, free individual strings first
                ${matrixParam.type === 'string[][]' ? `for (int j = 0; j < cols; j++) { if (${matrixParam.name}[i][j] != NULL) free(${matrixParam.name}[i][j]); }` : ''}
                free(${matrixParam.name}[i]);
            }
        }
        free(${matrixParam.name});
    }`;
            }

            for (const param of arrayParams) {
                if (param.type === 'string[]') {
                    cleanup += `
    if (${param.name} != NULL) {
        for (int i = 0; i < ${param.name}_size; i++) { if (${param.name}[i] != NULL) free(${param.name}[i]); }
    }`;
                }
                cleanup += `\n    if (${param.name} != NULL) free(${param.name});`;
            }


            return `
#include <stdio.h>
#include <stdlib.h> // For malloc, realloc, free, atoi, strtof, strtod
#include <string.h> // For strlen, strcpy, strcat, strtok, strcspn, strdup
#include <stdbool.h> // For bool type

// User's function signature
${signature}  // Add opening brace here
// User's code (this should be the function body)
${userCode}
} // Close the user's function block

int main() {
${inputParsers}

    // Call the user's function with the correctly parsed arguments
    printf("%d\n", ${functionName}(${mainFunctionCallArgs}));

${cleanup}
    return 0;
}
            `.trim();
        }



    case 'cpp': {
      const decl = params.map(p => {
        if (p.type === 'int') return `int ${p.name};`;
        if (p.type === 'string') return `string ${p.name};`;
        if (['int[]', 'vector<int>', 'vector<int>&'].includes(p.type)) return `vector<int> ${p.name};`;
        if (['string[]', 'vector<string>', 'vector<string>&'].includes(p.type)) return `vector<string> ${p.name};`;
        if (['int[][]', 'vector<vector<int>>', 'vector<vector<int>>&'].includes(p.type)) return `vector<vector<int>> ${p.name};`;
        if (['string[][]', 'vector<vector<string>>', 'vector<vector<string>>&'].includes(p.type)) return `vector<vector<string>> ${p.name};`;
        return `// Unsupported type for ${p.name}`;
      }).join('\n  ');
      const input = params.map(p => {
        if (p.type === 'int' || p.type === 'string') return `cin >> ${p.name};`;
        if (p.type === 'int[]' || p.type === 'string[]')
          return `{
    string temp;
    getline(cin >> ws, temp);
    stringstream ss(temp);
    string val;
    while (getline(ss, val, ' ')) {
        stringstream item(val);
        string num;
        while (getline(item, num, ',')) {
            if (!num.empty()) ${p.name}.push_back(stoi(num));
        }
    }
}`;
        if (p.type === 'int[][]' || p.type === 'string[][]')
          return `{
    string line_str;
    getline(cin >> ws, line_str);
    stringstream ss_rows(line_str);
    string row_str;
    while (getline(ss_rows, row_str, ';')) {
        vector<int> row_vec;
        stringstream ss_elements(row_str);
        string element_str;
        while (getline(ss_elements, element_str, ',')) {
            if (!element_str.empty()) {
                row_vec.push_back(stoi(element_str));
            }
        }
        ${p.name}.push_back(row_vec);
    }
}`;
        return `// Unsupported input type for ${p.name}`;
      }).join('\n  ');
      return `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>

using namespace std;

${signature}
${userCode}
}

int main() {
  ${decl}
  ${input}
  cout << ${functionName}(${argsStr}) << endl;
  return 0;
}
            `.trim();
    }

    default:
      return userCode;
  }
}