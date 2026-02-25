import { Icon, Input } from 'antd';
import { colors } from '../../theme/tokens';

interface TabSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function TabSearchBar({ value, onChange }: TabSearchBarProps) {
  return (
    <div className="tab-search-bar">
      <Input
        placeholder="Filter tabs..."
        prefix={<Icon type="search" style={{ color: colors.textDisabled }} />}
        suffix={
          value ? (
            <Icon
              type="close-circle"
              style={{ color: colors.textDisabled, cursor: 'pointer' }}
              onClick={() => onChange('')}
            />
          ) : null
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        size="small"
      />
    </div>
  );
}
