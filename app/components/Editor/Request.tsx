import * as React from 'react';
import * as Mousetrap from 'mousetrap'
import 'mousetrap/plugins/global-bind/mousetrap-global-bind';
import { Button, Icon, Tabs, Tooltip, notification } from 'antd';
import { Viewer } from './Viewer';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
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

interface RequestProps {
  data: string
  streamData: string[]
  onChangeData: (value: string) => void
  active?: boolean
}

export function Request({onChangeData, data, streamData, active}: RequestProps) {
  const editorTabKey = `editorTab`;

  const editorRef = React.useRef<ReactCodeMirrorRef>(null);
  React.useEffect(() => {
    if (active) {
      Mousetrap.bindGlobal('esc', () => {
        editorRef.current?.view?.focus();
      })
    }
  })

  function handleFormat() {
    try {
      const parsed = JSON.parse(data);
      const formatted = JSON.stringify(parsed, null, 2);
      onChangeData(formatted);
    } catch (e: any) {
      notification.error({
        message: 'Invalid JSON',
        description: e.message,
        duration: 3,
      });
    }
  }

  return (
    <>
      <Tabs
        defaultActiveKey={editorTabKey}
        tabPosition={"top"}
        style={{width: "100%"}}
      >
        <Tabs.TabPane tab="Editor" key={editorTabKey}>
          <div className="editor-toolbar">
            <Tooltip title="Format JSON">
              <Button size="small" onClick={handleFormat}>
                <Icon type="align-left" /> Format
              </Button>
            </Tooltip>
          </div>
          <CodeMirror
            ref={editorRef}
            value={data}
            height={"calc(100vh - 185px)"}
            extensions={[json(), jsonLinter, lintGutter()]}
            onChange={onChangeData}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: false,
              foldGutter: true,
              searchKeymap: true,
            }}
            style={{ fontSize: 13 }}
          />
        </Tabs.TabPane>
        {streamData.map((data, key) => (
          <Tabs.TabPane tab={`Stream ${key + 1}`} key={`${key}`}>
            <Viewer output={data} />
          </Tabs.TabPane>
        ))}
      </Tabs>
    </>
  )
}
