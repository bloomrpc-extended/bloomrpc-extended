import { useEffect } from 'react';
import { Tabs } from 'antd';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Editor, EditorEnvironment, EditorRequest } from '../Editor';
import { ProtoInfo, ProtoService } from '../../behaviour';
import { DraggableItem } from "./DraggableTabList";
import * as Mousetrap from 'mousetrap';
import 'mousetrap/plugins/global-bind/mousetrap-global-bind';

interface TabListProps {
  tabs: TabData[]
  activeKey?: string
  onChange?: (activeKey: string) => void
  onDelete?: (activeKey: string | React.MouseEvent<HTMLElement>) => void
  onEditorRequestChange?: (requestInfo: EditorTabRequest) => void
  onDragEnd: (indexes: {oldIndex: number, newIndex: number}) => void
  environmentList?: EditorEnvironment[],
  onEnvironmentChange?: () => void
}

export interface TabData {
  tabKey: string
  methodName: string
  service: ProtoService
  initialRequest?: EditorRequest,
}

export interface EditorTabRequest extends EditorRequest {
  id: string
}

export function TabList({ tabs, activeKey, onChange, onDelete, onDragEnd, onEditorRequestChange, environmentList, onEnvironmentChange }: TabListProps) {
  const tabsWithMatchingKey =
    tabs.filter(tab => tab.tabKey === activeKey);

  const tabActiveKey = tabsWithMatchingKey.length === 0
    ? tabs.map(tab => tab.tabKey).pop()
    : tabsWithMatchingKey.map(tab => tab.tabKey).pop();

  useEffect(() => {
    Mousetrap.bindGlobal(['command+w', 'ctrl+w'], () => {
      if (tabActiveKey) {
        onDelete?.(tabActiveKey);
      }
      return false;
    });

    return () => {
      Mousetrap.unbind(['command+w', 'ctrl+w']);
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tabs.findIndex(tab => tab.tabKey === active.id);
      const newIndex = tabs.findIndex(tab => tab.tabKey === over.id);
      onDragEnd({ oldIndex, newIndex });
    }
  }

  const tabKeys = tabs.map(tab => tab.tabKey);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={tabKeys} strategy={horizontalListSortingStrategy}>
        <Tabs
          className={"draggable-tabs"}
          onEdit={(targetKey, action) => {
            if (action === "remove") {
              onDelete?.(targetKey);
            }
          }}
          onChange={onChange}
          tabBarStyle={styles.tabBarStyle}
          style={styles.tabList}
          activeKey={tabActiveKey || "0"}
          hideAdd
          type="editable-card"
          renderTabBar={(props, DefaultTabBar) => {
            return (
              <DefaultTabBar {...props}>
                {(node: any) => {
                  const nodeTab = tabs.find(tab => tab.tabKey === node.key);
                  return (
                    <DraggableItem
                      active={nodeTab && nodeTab.tabKey === activeKey}
                      id={node.key}
                      key={node.key}
                    >
                      {node}
                    </DraggableItem>
                  )
                }}
              </DefaultTabBar>
            )
          }}
        >
          {tabs.length === 0 ? (
            <Tabs.TabPane tab="New Tab" key="0" closable={false}>
              <Editor
                active={true}
                environmentList={environmentList}
                onEnvironmentListChange={onEnvironmentChange}
              />
            </Tabs.TabPane>
          ) : (
            tabs.map((tab) => (
              <Tabs.TabPane
                tab={`${tab.service.serviceName}.${tab.methodName}`}
                key={tab.tabKey}
                closable={true}
              >
                <Editor
                  active={tab.tabKey === activeKey}
                  environmentList={environmentList}
                  protoInfo={new ProtoInfo(tab.service, tab.methodName)}
                  key={tab.tabKey}
                  initialRequest={tab.initialRequest}
                  onEnvironmentListChange={onEnvironmentChange}
                  onRequestChange={(editorRequest: EditorRequest) => {
                    onEditorRequestChange?.({
                      id: tab.tabKey,
                      ...editorRequest
                    })
                  }}
                />
              </Tabs.TabPane>
            ))
          )}
        </Tabs>
      </SortableContext>
    </DndContext>
  );
}

const styles = {
  tabList: {
    height: "100%"
  },
  tabBarStyle: {
    padding: "10px 0px 0px 20px",
    marginBottom: "0px",
  }
};
