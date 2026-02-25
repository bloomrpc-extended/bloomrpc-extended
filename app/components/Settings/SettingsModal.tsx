import { Modal, Switch, Icon } from 'antd';
import { TabUXSettings } from '../../storage/settings';
import { colors, fontSize, spacing } from '../../theme/tokens';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  settings: TabUXSettings;
  onSettingsChange: (settings: TabUXSettings) => void;
}

export function SettingsModal({ visible, onClose, settings, onSettingsChange }: SettingsModalProps) {
  function toggle(key: keyof TabUXSettings) {
    onSettingsChange({ ...settings, [key]: !settings[key] });
  }

  return (
    <Modal
      title={
        <div>
          <Icon type="setting" />
          <span style={{ marginLeft: spacing.sm }}>Settings</span>
        </div>
      }
      transitionName="" maskTransitionName=""
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={420}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.base }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500 }}>Tab Search</div>
            <div style={{ fontSize: fontSize.sm, color: colors.textMuted }}>Filter tabs by method or service name</div>
          </div>
          <Switch checked={settings.tabSearchEnabled} onChange={() => toggle('tabSearchEnabled')} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500 }}>Tab Grouping</div>
            <div style={{ fontSize: fontSize.sm, color: colors.textMuted }}>Color-code tabs by service</div>
          </div>
          <Switch checked={settings.tabGroupingEnabled} onChange={() => toggle('tabGroupingEnabled')} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 500 }}>Tab Overflow Menu</div>
            <div style={{ fontSize: fontSize.sm, color: colors.textMuted }}>Dropdown listing all open tabs</div>
          </div>
          <Switch checked={settings.tabOverflowMenuEnabled} onChange={() => toggle('tabOverflowMenuEnabled')} />
        </div>
      </div>
    </Modal>
  );
}
