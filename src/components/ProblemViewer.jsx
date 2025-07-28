const ProblemViewer = ({ problem }) => (
  <div className="bg-gray-100 p-4 rounded my-4">
    <div dangerouslySetInnerHTML={{ __html: problem.description }} />
    <h4 className="font-semibold mt-2">Sample Test Cases:</h4>
    <pre className="bg-white p-2 rounded">
      {problem.sampleTestCases.map((tc, i) => (
        <div key={i}>
          Input: {tc.input} <br />
          Expected Output: {tc.expectedOutput}
          <hr className="my-1" />
        </div>
      ))}
    </pre>
  </div>
);
export default ProblemViewer;
