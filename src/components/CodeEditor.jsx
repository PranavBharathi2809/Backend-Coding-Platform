import Editor from "@monaco-editor/react";

const CodeEditor = ({ code, setCode }) => {
  return (
    <div className="my-4">
      <Editor
        height="400px"
        language="python"
        theme="vs-dark"
        value={code}
        onChange={(val) => setCode(val)}
      />
    </div>
  );
};

export default CodeEditor;
