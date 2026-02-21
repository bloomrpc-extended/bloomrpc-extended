import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';

interface ResponseProps {
  output: string,
  responseTime?: number
  emptyContent?: Node | Element | JSX.Element
}

export function Viewer({ output, responseTime, emptyContent }: ResponseProps) {
  return (
    <div style={styles.responseContainer}>
      {!output && emptyContent}

      { responseTime && (
          <div style={styles.responseTime}>
            {responseTime.toFixed(3)}s
          </div>
      )}

      {output && (
        <CodeMirror
          value={output}
          height={"calc(100vh - 188px)"}
          extensions={[json()]}
          readOnly
          editable={false}
          basicSetup={{
            lineNumbers: false,
            highlightActiveLine: false,
            foldGutter: false,
            searchKeymap: true,
          }}
          style={{ fontSize: 13, background: "#fff" }}
        />
      )}
    </div>
  )
}

const styles = {
  responseContainer: {
    background: "white",
    position: "relative" as const,
  },
  responseTime: {
    userSelect: "none" as const,
    fontSize: 11,
    padding: "3px 7px",
    background: '#f3f6f7',
    position: "absolute" as const,
    top: "5px",
    right: "0px",
    zIndex: 30,
  }
};
