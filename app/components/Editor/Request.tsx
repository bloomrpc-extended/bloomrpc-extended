import * as React from 'react';
import * as Mousetrap from 'mousetrap'
import 'mousetrap/plugins/global-bind/mousetrap-global-bind';
import { Tabs } from 'antd';
import { Viewer } from './Viewer';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { search } from '@codemirror/search';

interface RequestProps {
  data: string
  streamData: string[]
  onChangeData: (value: string) => void
  active?: boolean
  editorFontSize: number
}

export function Request({onChangeData, data, streamData, active, editorFontSize}: RequestProps) {
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
            extensions={[json(), search()]}
            onChange={onChangeData}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: false,
              foldGutter: true,
              searchKeymap: true,
            }}
            style={{ fontSize: editorFontSize }}
          />
        </Tabs.TabPane>
        {streamData.map((data, key) => (
          <Tabs.TabPane tab={`Stream ${key + 1}`} key={`${key}`}>
            <Viewer output={data} editorFontSize={editorFontSize} />
          </Tabs.TabPane>
        ))}
      </Tabs>
    </>
  )
}
