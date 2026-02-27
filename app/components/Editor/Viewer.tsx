import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { colors, fontSize, spacing, zIndex } from '../../theme/tokens';

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
            foldGutter: true,
            searchKeymap: true,
          }}
          style={{ fontSize: fontSize.base, background: colors.white }}
        />
      )}
    </div>
  )
}

const styles = {
  responseContainer: {
    background: colors.white,
    position: "relative" as const,
  },
  responseTime: {
    userSelect: "none" as const,
    fontSize: fontSize.xs,
    padding: `${spacing.xs}px ${spacing.sm - 1}px`,
    background: colors.bgHighlight,
    position: "absolute" as const,
    top: `${spacing.xs}px`,
    right: "0px",
    zIndex: zIndex.popover,
  },
};
