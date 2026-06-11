import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { search } from '@codemirror/search';
import { Icon, Tooltip } from 'antd';
import { colors, fontSize, spacing, zIndex } from '../../theme/tokens';

interface ResponseProps {
  output: string,
  responseTime?: number
  emptyContent?: Node | Element | JSX.Element
  editorFontSize?: number
}

export function Viewer({ output, responseTime, emptyContent, editorFontSize = fontSize.base }: ResponseProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div style={styles.responseContainer}>
      {!output && emptyContent}

      {(output || responseTime) && (
        <div style={styles.actionBar}>
          {output && (
            <Tooltip title={copied ? "Copied!" : "Copy response"}>
              <div style={styles.copyButton} onClick={handleCopy}>
                <Icon type={copied ? "check" : "copy"} />
              </div>
            </Tooltip>
          )}

          {responseTime && (
            <div style={styles.responseTime}>
              {responseTime.toFixed(3)}s
            </div>
          )}
        </div>
      )}

      {output && (
        <CodeMirror
          value={output}
          height={"calc(100vh - 188px)"}
          extensions={[json(), search()]}
          readOnly
          editable={false}
          basicSetup={{
            lineNumbers: false,
            highlightActiveLine: false,
            foldGutter: true,
            searchKeymap: true,
          }}
          style={{ fontSize: editorFontSize, background: colors.white }}
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
  actionBar: {
    display: "flex",
    alignItems: "center" as const,
    gap: `${spacing.xs}px`,
    position: "absolute" as const,
    top: `${spacing.xs}px`,
    right: "0px",
    zIndex: zIndex.popover,
  },
  copyButton: {
    cursor: "pointer",
    fontSize: fontSize.xs,
    padding: `${spacing.xs}px ${spacing.sm - 1}px`,
    background: colors.bgHighlight,
  },
  responseTime: {
    userSelect: "none" as const,
    fontSize: fontSize.xs,
    padding: `${spacing.xs}px ${spacing.sm - 1}px`,
    background: colors.bgHighlight,
  },
};
