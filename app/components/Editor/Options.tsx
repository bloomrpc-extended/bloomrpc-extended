import { Button, Tooltip, Switch, Modal, Dropdown, Menu, Icon } from 'antd';
import { setInteractive, setProtoVisibility, setGrpcWeb } from './actions';
import { EditorAction } from './Editor';
import {useState} from "react";
import {TLSManager} from "./TLSManager";
import { ProtoInfo, Certificate } from '../../behaviour';
import { colors, fontSize, radius, spacing } from '../../theme/tokens';
import { useCloseAnimation } from '../../hooks/useCloseAnimation';

interface OptionsProps {
  protoInfo: ProtoInfo
  dispatch: React.Dispatch<EditorAction>
  interactiveChecked: boolean
  grpcWebChecked: boolean
  onInteractiveChange?: (chcked: boolean) => void
  tlsSelected?: Certificate
  onTLSSelected?: (selected: Certificate) => void
  onClickExport?: () => void
}

export function Options({ dispatch, grpcWebChecked, interactiveChecked, onInteractiveChange, tlsSelected, onTLSSelected, onClickExport }: OptionsProps) {

  const [tlsModalVisible, setTlsModalVisible] = useState(false);
  const { shouldRender: tlsRender, closing: tlsClosing } = useCloseAnimation(tlsModalVisible);

  return (
    <div style={{...styles.optionContainer, ...styles.inline}}>

      <div style={{paddingLeft: spacing.base}}>
          <div style={{
            display: "flex",
            alignItems: "center",
          }}>
            <Tooltip placement="bottom" title={tlsSelected ? "Secure Connection" : "Unsecure Connection"}>
              {tlsSelected
                ? <Icon type="lock" style={{ fontSize: fontSize.lg, color: colors.success }} />
                : <Icon type="unlock" style={{ fontSize: fontSize.lg, color: colors.textDisabled }} />
              }
            </Tooltip>
            <span
              onClick={() => setTlsModalVisible(true)}
              style={styles.tlsButton}
            >
              <span style={{}}>TLS</span>
            </span>
          </div>

          <Modal
              title={(
                  <div>
                    <Icon type="lock" />
                    <span style={{marginLeft: 10}}> TLS / SSL Manager </span>
                  </div>
              )}
              transitionName="" maskTransitionName=""
              visible={tlsRender}
              wrapClassName={tlsClosing ? 'modal-closing' : ''}
              onCancel={() => setTlsModalVisible(false)}
              onOk={() => setTlsModalVisible(false)}
              bodyStyle={{ padding: 0 }}
              width={750}
              okText={"Done"}
              cancelText={"Close"}
          >
            <TLSManager
                selected={tlsSelected}
                onSelected={onTLSSelected}
            />
          </Modal>
      </div>

      <div style={{ ...styles.inline }}>
        <Dropdown
            overlay={(
              <Menu>
                <Menu.Item key="0" onClick={() => onClickExport && onClickExport()}>
                  Export response
                </Menu.Item>
              </Menu>
            )}
            trigger={['click']}
        >
          <div style={{ marginRight: spacing.xs, marginTop: spacing.xxs, cursor: 'pointer', color: colors.textDisabled }} >
            <Icon type="caret-down" />
          </div>
        </Dropdown>
        <div style={{paddingRight: 10}}>
          <Switch
            checkedChildren="WEB &nbsp;"
            defaultChecked={grpcWebChecked}
            unCheckedChildren="GRPC"
            onChange={(checked) => {
              dispatch(setGrpcWeb(checked));
            }}
          />
        </div>
        <div style={{paddingRight: 10}}>
          <Switch
            checkedChildren="Interactive"
            defaultChecked={interactiveChecked}
            unCheckedChildren="Manual &nbsp; &nbsp; &nbsp;"
            onChange={(checked) => {
              dispatch(setInteractive(checked));
              onInteractiveChange?.(checked);
            }}
          />
        </div>

        <Button
          icon="file"
          type="dashed"
          onClick={() => dispatch(setProtoVisibility(true))}
        >
          View Proto
        </Button>
      </div>
    </div>
  )
}

const styles = {
  optionContainer: {
    width: "50%",
  },
  inline: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tlsButton: {
    marginLeft: spacing.sm,
    cursor: "pointer",
    background: colors.bgPanel,
    padding: `1px ${spacing.sm}px`,
    borderRadius: `${radius.sm}px`,
    fontWeight: 500,
    fontSize: `${fontSize.base}px`,
    border: `1px solid ${colors.borderLight}`,
  },
};
