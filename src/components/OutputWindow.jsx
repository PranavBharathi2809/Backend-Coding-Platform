const OutputWindow = ({ output, outputType }) => {
  if (!output) return null;

  return (
    <div className="mt-6 bg-gray-100 p-4 rounded shadow">
      <h3 className="text-lg font-bold mb-2">
        {outputType === "run" ? "Run Output" : "Submission Result"}
      </h3>

      {outputType === "run" && (
        <pre className="bg-white p-2 rounded text-sm text-green-800">
          {output.output || output.stderr || "No output"}
        </pre>
      )}

      {outputType === "submit" && (
        <div>
          <p>
            <strong>Status:</strong> {output.status}
          </p>
          <p>
            <strong>Passed:</strong> {output.passed}/{output.total}
          </p>
          <div className="mt-2 space-y-2">
            {output.testResults?.map((test, index) => (
              <div
                key={index}
                className={`p-2 rounded ${
                  test.passed ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <p>
                  <strong>Input:</strong> {test.input}
                </p>
                <p>
                  <strong>Expected:</strong> {test.expected}
                </p>
                <p>
                  <strong>Actual:</strong> {test.actual}
                </p>
                {!test.passed && (
                  <p className="text-red-600">
                      Test case failed
                    {test.stderr && ` — Error: ${test.stderr}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OutputWindow;
