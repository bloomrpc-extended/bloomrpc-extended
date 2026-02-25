import * as React from 'react';
import { fontSize } from '../../theme/tokens';
import * as Mousetrap from 'mousetrap'
import 'mousetrap/plugins/global-bind/mousetrap-global-bind';
import { Tabs } from 'antd';
import { Viewer } from './Viewer';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';

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

  return (
    <>
      <Tabs
        defaultActiveKey={editorTabKey}
        tabPosition={"top"}
        style={{width: "100%"}}
      >
        <Tabs.TabPane tab="Editor" key={editorTabKey}>
          <CodeMirror
            ref={editorRef}
            value={data}
            height={"calc(100vh - 185px)"}
            extensions={[json()]}
            onChange={onChangeData}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: false,
              foldGutter: true,
              searchKeymap: true,
            }}
            style={{ fontSize: fontSize.base }}
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
