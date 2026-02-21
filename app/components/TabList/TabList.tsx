import { useEffect, useMemo, useState } from 'react';
import { Tabs, Icon, Tooltip } from 'antd';
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
import { TabSearchBar } from "./TabSearchBar";
import { TabOverflowMenu } from "./TabOverflowMenu";
import { TabUXSettings } from '../../storage/settings';
import * as Mousetrap from 'mousetrap';
import 'mousetrap/plugins/global-bind/mousetrap-global-bind';

interface TabListProps {
  tabs: TabData[]
  activeKey?: string
  onChange?: (activeKey: string) => void
  onDelete?: (activeKey: string | React.MouseEvent<HTMLElement>) => void
  onEditorRequestChange?: (requestInfo: EditorTabRequest) => void
  onDragEnd: (indexes: {oldIndex: number, newIndex: number}) => void
  onCloseAll?: () => void
  environmentList?: EditorEnvironment[],
  onEnvironmentChange?: () => void
  settings?: TabUXSettings
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

const SERVICE_COLORS = [
  '#1890ff', '#52c41a', '#fa8c16', '#eb2f96', '#722ed1',
  '#13c2c2', '#f5222d', '#a0d911', '#faad14', '#2f54eb',
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function buildServiceColorMap(tabs: TabData[]): Map<string, string> {
  const map = new Map<string, string>();
  const services = [...new Set(tabs.map(t => t.service.serviceName))];
  services.forEach((name) => {
    map.set(name, SERVICE_COLORS[hashString(name) % SERVICE_COLORS.length]);
  });
  return map;
}

export function TabList({ tabs, activeKey, onChange, onDelete, onDragEnd, onCloseAll, onEditorRequestChange, environmentList, onEnvironmentChange, settings }: TabListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const serviceColorMap = useMemo(
    () => settings?.tabGroupingEnabled ? buildServiceColorMap(tabs) : new Map<string, string>(),
    [tabs, settings?.tabGroupingEnabled]
  );

  // Determine display order: sort by service name when grouping is enabled
  const displayTabs = useMemo(() => {
    if (!settings?.tabGroupingEnabled) return tabs;
    const sorted = [...tabs].sort((a, b) =>
      a.service.serviceName.localeCompare(b.service.serviceName)
    );
    return sorted;
  }, [tabs, settings?.tabGroupingEnabled]);

  // Filter tabs based on search query
  const filteredTabs = useMemo(() => {
    if (!searchQuery || !settings?.tabSearchEnabled) return displayTabs;
    const q = searchQuery.toLowerCase();
    return displayTabs.filter(tab =>
      tab.methodName.toLowerCase().includes(q) ||
      tab.service.serviceName.toLowerCase().includes(q)
    );
  }, [displayTabs, searchQuery, settings?.tabSearchEnabled]);

  const tabsWithMatchingKey =
    filteredTabs.filter(tab => tab.tabKey === activeKey);

  const tabActiveKey = tabsWithMatchingKey.length === 0
    ? filteredTabs.map(tab => tab.tabKey).pop()
    : tabsWithMatchingKey.map(tab => tab.tabKey).pop();

  // Auto-switch active tab if current one is filtered out
  useEffect(() => {
    if (
      settings?.tabSearchEnabled &&
      searchQuery &&
      filteredTabs.length > 0 &&
      activeKey &&
      !filteredTabs.find(t => t.tabKey === activeKey)
    ) {
      onChange?.(filteredTabs[0].tabKey);
    }
  }, [filteredTabs, activeKey, searchQuery, settings?.tabSearchEnabled]);

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
      // Map display indices back to original tab array indices for DnD persistence
      const oldIndex = tabs.findIndex(tab => tab.tabKey === active.id);
      const newIndex = tabs.findIndex(tab => tab.tabKey === over.id);
      onDragEnd({ oldIndex, newIndex });
    }
  }

  function renderTabLabel(tab: TabData) {
    const color = settings?.tabGroupingEnabled ? serviceColorMap.get(tab.service.serviceName) : undefined;
    const label = `${tab.service.serviceName}.${tab.methodName}`;
    if (!color) return label;
    return (
      <span>
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: color,
            marginRight: 6,
          }}
        />
        {label}
      </span>
    );
  }

  const tabKeys = filteredTabs.map(tab => tab.tabKey);

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
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1, overflow: 'hidden' }}>
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
                </div>
                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  {settings?.tabSearchEnabled && (
                    <TabSearchBar value={searchQuery} onChange={setSearchQuery} />
                  )}
                  {settings?.tabOverflowMenuEnabled && tabs.length > 0 && (
                    <TabOverflowMenu
                      tabs={tabs}
                      activeKey={activeKey || "0"}
                      onSelect={(key) => onChange?.(key)}
                      serviceColorMap={settings?.tabGroupingEnabled ? serviceColorMap : undefined}
                    />
                  )}
                  {tabs.length > 0 && (
                    <Tooltip title="Close all tabs">
                      <Icon
                        type="close-square"
                        className="tab-close-all"
                        onClick={onCloseAll}
                      />
                    </Tooltip>
                  )}
                </div>
              </div>
            )
          }}
        >
          {filteredTabs.length === 0 && tabs.length === 0 ? (
            <Tabs.TabPane tab="New Tab" key="0" closable={false}>
              <Editor
                active={true}
                environmentList={environmentList}
                onEnvironmentListChange={onEnvironmentChange}
              />
            </Tabs.TabPane>
          ) : (
            filteredTabs.map((tab) => (
              <Tabs.TabPane
                tab={renderTabLabel(tab)}
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
