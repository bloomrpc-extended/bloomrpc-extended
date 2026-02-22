import { Icon } from 'antd';
import { storeMetadata } from "../../storage";
import { useState, useRef, useCallback } from "react";
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { linter, lintGutter, Diagnostic } from '@codemirror/lint';

const jsonLinter = linter((view) => {
  const diagnostics: Diagnostic[] = [];
  const text = view.state.doc.toString();
  if (!text.trim()) return diagnostics;
  try {
    JSON.parse(text);
  } catch (e: any) {
    const match = e.message.match(/position (\d+)/);
    const pos = match ? Math.min(Number(match[1]), text.length) : 0;
    diagnostics.push({
      from: pos,
      to: Math.min(pos + 1, text.length),
      severity: 'error',
      message: e.message,
    });
  }
  return diagnostics;
});

const COLLAPSED_HEIGHT = 32;
const EXPANDED_HEIGHT = 250;
const MAX_HEIGHT = 500;

interface MetadataProps {
  onClickMetadata: () => void,
  onMetadataChange: (value: string) => void,
  value: string,
}

export function Metadata({ onClickMetadata, onMetadataChange, value }: MetadataProps) {
  const [height, setHeight] = useState(COLLAPSED_HEIGHT);
  const expanded = height > COLLAPSED_HEIGHT;
  const dragRef = useRef<{ startY: number; startHeight: number } | null>(null);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    if (!expanded) return;
    e.preventDefault();
    dragRef.current = { startY: e.clientY, startHeight: height };

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.startY - ev.clientY;
      const newHeight = Math.min(MAX_HEIGHT, Math.max(EXPANDED_HEIGHT, dragRef.current.startHeight + delta));
      setHeight(newHeight);
    };
    const onMouseUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [height, expanded]);

  return (
    <div
      className="metadata-panel"
      style={{
        ...styles.container,
        height: expanded ? `${height}px` : `${COLLAPSED_HEIGHT}px`,
      }}
    >
      {expanded && (
        <div style={styles.dragHandle} onMouseDown={onDragStart} />
      )}

      {expanded && (
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <CodeMirror
            value={value}
            height="100%"
            extensions={[json(), jsonLinter, lintGutter()]}
            onChange={(value) => {
              storeMetadata(value);
              onMetadataChange(value);
            }}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: false,
              foldGutter: false,
            }}
            style={{ fontSize: 13, background: "#f5f5f5", height: '100%' }}
          />
        </div>
      )}

      <div style={styles.labelBar}>
        <a
          href={"#"}
          style={styles.optionLink}
          onClick={(e) => {
            e.preventDefault();
            if (expanded) {
              setHeight(COLLAPSED_HEIGHT);
            } else {
              setHeight(EXPANDED_HEIGHT);
            }
            onClickMetadata();
          }}
        > {expanded ? <Icon type="down" /> : <Icon type="up" />} METADATA </a>
      </div>
    </div>
  )
}

const styles = {
  labelBar: {
    background: "#001529",
    padding: "5px 10px",
    flexShrink: 0,
    cursor: "pointer",
    fontWeight: 900 as const,
    fontSize: "13px",
  },
  container: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    background: "#f5f5f5",
    borderTop: "2px solid rgba(0, 21, 41, 0.3)",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
    boxShadow: "0 -2px 8px rgba(0,0,0,0.15)",
  },
  dragHandle: {
    height: "5px",
    cursor: "ns-resize",
    background: "#ddd",
    flexShrink: 0,
  },
  optionLink: {
    color: "#fff",
    textDecoration: "none",
  },
};
