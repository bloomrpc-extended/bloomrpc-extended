import { Badge, Dropdown, Icon, Menu } from 'antd';
import { TabData } from './TabList';

interface TabOverflowMenuProps {
  tabs: TabData[];
  activeKey: string;
  onSelect: (tabKey: string) => void;
  serviceColorMap?: Map<string, string>;
}

export function TabOverflowMenu({ tabs, activeKey, onSelect, serviceColorMap }: TabOverflowMenuProps) {
  const menu = (
    <Menu selectedKeys={[activeKey]}>
      {tabs.map((tab) => {
        const color = serviceColorMap?.get(tab.service.serviceName);
        return (
          <Menu.Item key={tab.tabKey} onClick={() => onSelect(tab.tabKey)}>
            {color && (
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
            )}
            {tab.service.serviceName}.{tab.methodName}
          </Menu.Item>
        );
      })}
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
      <div className="tab-overflow-trigger">
        <Badge count={tabs.length} style={{ backgroundColor: '#1890ff' }}>
          <Icon type="unordered-list" style={{ fontSize: 16, color: '#555', cursor: 'pointer' }} />
        </Badge>
      </div>
    </Dropdown>
  );
}
