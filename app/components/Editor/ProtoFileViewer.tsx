import { Drawer } from 'antd';
import { ProtoInfo } from '../../behaviour';
import { colors, fontSize, spacing } from '../../theme/tokens';
import CodeMirror from '@uiw/react-codemirror';

interface ProtoFileViewerProps {
  protoInfo: ProtoInfo
  visible: boolean
  onClose: () => void
}

export function ProtoFileViewer({ protoInfo, visible, onClose }: ProtoFileViewerProps) {

  return (
    <Drawer
      title={protoInfo.service.proto.fileName.split('/').pop()}
      placement={"right"}
      width={"50%"}
      closable={false}
      onClose={onClose}
      visible={visible}
      style={{ transition: 'none' }}
    >
      <CodeMirror
        value={protoInfo.service.proto.protoText}
        height={"calc(100vh - 115px)"}
        readOnly
        editable={false}
        basicSetup={{
          lineNumbers: false,
          highlightActiveLine: false,
          foldGutter: false,
        }}
        style={{ marginTop: `${spacing.sm}px`, fontSize: fontSize.base, background: colors.white }}
      />
    </Drawer>
  );
}
