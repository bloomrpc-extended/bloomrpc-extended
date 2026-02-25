import { Icon } from 'antd';
import { Resizable } from 're-resizable';
import { storeMetadata } from "../../storage";
import { useState } from "react";
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { colors, fontSize, spacing, zIndex } from '../../theme/tokens';

interface MetadataProps {
  onClickMetadata: () => void,
  onMetadataChange: (value: string) => void,
  value: string,
}

export function Metadata({ onClickMetadata, onMetadataChange, value }: MetadataProps) {
  const [height, setHeight] = useState(38);
  const visibile = height > 38;

  return (
    <Resizable
        size={{width: "100%", height: height}}
        maxHeight={500}
        minHeight={38}
        enable={{top:true, right:false, bottom:true, left:false, topRight:false, bottomRight:false, bottomLeft:false, topLeft:false}}
        onResizeStop={(e, direction, ref, d) => {
          setHeight(height + d.height);
        }}
        className="meatada-panel"
         style={{
           ...styles.optionContainer,
           bottom: `-38px`, height: `${height}px`,
         }}
    >
      <div>
        <div style={styles.optionLabel}>
          <a
            href={"#"}
            style={styles.optionLink}
            onClick={() => {
              if (visibile) {
                setHeight(38)
              } else {
                setHeight(150);
              }
              onClickMetadata()
            }}
          > {visibile ? <Icon type="down" /> : <Icon type="up" />} METADATA </a>
        </div>

        <div>
          <CodeMirror
            value={value}
            height={`${height + 20}px`}
            extensions={[json()]}
            onChange={(value) => {
              storeMetadata(value);
              onMetadataChange(value);
            }}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: false,
              foldGutter: false,
            }}
            style={{ fontSize: fontSize.base, background: colors.bgSubtle }}
          />
        </div>
      </div>
    </Resizable>
  )
}

const styles = {
  optionLabel: {
    background: colors.bgDark,
    padding: `${spacing.sm - 1}px ${spacing.sm}px`,
    marginBottom: `${spacing.xs}px`,
  },
  optionContainer: {
    position: "absolute" as const,
    fontWeight: 900,
    fontSize: `${fontSize.base}px`,
    borderLeft: `1px solid ${colors.borderSubtle}`,
    background: colors.bgSubtle,
    zIndex: zIndex.content,
  },
  optionLink: {
    color: colors.white,
    textDecoration: "none",
  },
};
