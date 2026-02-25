import * as React from 'react';
import { EditorAction, EditorState } from './Editor';
import { PlayButton } from './PlayButton';
import { Icon, Tooltip } from 'antd';
import { setRequestStreamData, setStreamCommitted } from './actions';
import { ProtoInfo } from '../../behaviour';
import { colors, fontSize, spacing } from '../../theme/tokens';

export interface ControlsStateProps {
  dispatch: React.Dispatch<EditorAction>
  state: EditorState
  protoInfo?: ProtoInfo
  active?: boolean
}

export function Controls({ dispatch, state, protoInfo, active }: ControlsStateProps) {
  return (
    <div>
      <PlayButton
        active={active}
        dispatch={dispatch}
        state={state}
        protoInfo={protoInfo}
      />

      { isControlVisible(state) &&
        (
          <div style={styles.controlsContainer}>
            <Tooltip placement="topLeft" title={"Push Data"}>
              <div style={styles.pushData} onClick={() => {
                if (state.call) {
                  dispatch(setRequestStreamData([
                    ...state.requestStreamData,
                    state.data,
                  ]));
                  state.call.write(state.data);
                }
              }}>
                <Icon type="double-right" />
              </div>
            </Tooltip>

            <Tooltip placement="topRight" title={"Commit Stream"}>
              <div
                style={styles.commit}
                onClick={() => {
                  if (state.call) {
                    state.call.commitStream();
                    dispatch(setStreamCommitted(true));
                  }
                }}>
                <Icon type="check" />
              </div>
            </Tooltip>
          </div>
        )}
      </div>
  );
}

export function isControlVisible(state: EditorState) {
  return Boolean(
      (state.interactive && state.loading) &&
      (state.call && state.call.protoInfo.isClientStreaming()) &&
      !state.streamCommitted);
}

const styles = {
  controlsContainer: {
    display: "flex",
    marginLeft: `-${spacing.base}px`,
    marginTop: spacing.base,
  },
  pushData: {
    background: colors.streamPush,
    color: colors.white,
    padding: `${spacing.sm}px`,
    paddingLeft: `${spacing.md}px`,
    borderRadius: "50% 0 0 50%",
    fontSize: `${fontSize.lg}px`,
    cursor: "pointer",
    border: `2px solid ${colors.borderLight}`,
    borderRight: "none",
  },
  commit: {
    background: colors.success,
    color: colors.white,
    padding: `${spacing.sm}px`,
    paddingLeft: `${spacing.md}px`,
    borderRadius: "0 50% 50% 0",
    fontSize: `${fontSize.lg}px`,
    cursor: "pointer",
    border: `2px solid ${colors.borderLight}`,
    borderLeft: "none",
  },
};
