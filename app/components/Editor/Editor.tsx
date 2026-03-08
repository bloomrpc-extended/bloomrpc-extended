import { useEffect, useReducer, useState } from 'react';
import * as Mousetrap from 'mousetrap';
import 'mousetrap/plugins/global-bind/mousetrap-global-bind';
import {
  actions,
  setData, setEnvironment, setInteractive,
  setMetadata,
  setMetadataVisibilty,
  setProtoVisibility,
  setTSLCertificate,
  setUrl,
} from './actions';
import { Response } from './Response';
import { Metadata } from './Metadata';
import { Controls, isControlVisible } from './Controls';
import { Request } from './Request';
import { Options } from './Options';
import { ProtoFileViewer } from './ProtoFileViewer';
import { Certificate, ProtoInfo, GRPCEventEmitter } from '../../behaviour';
import { getMetadata, getUrl, storeUrl } from '../../storage';

import { exportResponseToJSONFile } from "../../behaviour/response";
import { colors, shadow, spacing, zIndex } from '../../theme/tokens';
import { Resizable } from "re-resizable";
import { AddressBar } from "./AddressBar";
import { deleteEnvironment, getEnvironments, saveEnvironment } from "../../storage/environments";
import { getTabUXSettings, storeTabUXSettings, EDITOR_FONT_SIZES } from "../../storage/settings";

export interface EditorAction {
  [key: string]: any
  type: string
}

export interface EditorEnvironment {
  name: string
  url: string
  metadata: string,
  interactive: boolean
  tlsCertificate: Certificate,
}

export interface EditorRequest {
  url: string
  data: string
  inputs?: string // @deprecated
  metadata: string
  interactive: boolean
  environment?: string
  grpcWeb: boolean
  tlsCertificate?: Certificate
}

export interface EditorState extends EditorRequest {
  loading: boolean
  response: EditorResponse
  metadataOpened: boolean
  protoViewVisible: boolean
  requestStreamData: string[]
  responseStreamData: EditorResponse[]
  streamCommitted: boolean
  call?: GRPCEventEmitter
}

export interface EditorProps {
  protoInfo?: ProtoInfo
  onRequestChange?: (editorRequest: EditorRequest & EditorState) => void
  initialRequest?: EditorRequest
  environmentList?: EditorEnvironment[]
  onEnvironmentListChange?: (environmentList: EditorEnvironment[]) => void
  active?: boolean
}

export interface EditorResponse {
  output: string;
  responseTime?: number;
}

const INITIAL_STATE: EditorState = {
  url: "0.0.0.0:3009",
  data: "",
  metadata: "",
  requestStreamData: [],
  responseStreamData: [],
  interactive: false,
  grpcWeb: false,
  loading: false,
  response: {
    output: "",
    responseTime: undefined,
  },
  metadataOpened: false,
  protoViewVisible: false,
  streamCommitted: false,
  tlsCertificate: undefined,
  call: undefined,
};

/**
 * Reducer
 * @param state
 * @param action
 */
const reducer = (state: EditorState, action: EditorAction) => {
  switch (action.type) {

    case actions.SET_DATA:
      return { ...state, data: action.data };

    case actions.SET_URL:
      return { ...state, url: action.value };

    case actions.SET_IS_LOADING:
      return { ...state, loading: action.isLoading };

    case actions.SET_RESPONSE:
      return { ...state, response: action.response };

    case actions.SET_CALL:
      return { ...state, call: action.call };

    case actions.SET_METADATA_VISIBILITY:
      return { ...state, metadataOpened: action.visible };

    case actions.SET_METADATA:
      return { ...state, metadata: action.metadata };

    case actions.SET_PROTO_VISIBILITY:
      return { ...state, protoViewVisible: action.visible };

    case actions.SET_INTERACTIVE:
      return { ...state, interactive: action.interactive };

    case actions.SET_GRPC_WEB:
      return { ...state, grpcWeb: action.grpcWeb };

    case actions.SET_REQUEST_STREAM_DATA:
      return { ...state, requestStreamData: action.requestData };

    case actions.SET_RESPONSE_STREAM_DATA:
      return { ...state, responseStreamData: action.responseData };

    case actions.ADD_RESPONSE_STREAM_DATA:
      return { ...state, responseStreamData: [...state.responseStreamData, action.responseData] };

    case actions.SET_STREAM_COMMITTED:
      return { ...state, streamCommitted: action.committed };

    case actions.SET_SSL_CERTIFICATE:
      return { ...state, tlsCertificate: action.certificate };

    case actions.SET_ENVIRONMENT:
      return { ...state, environment: action.environment };

    default:
      return state
  }
};

export function Editor({ protoInfo, initialRequest, onRequestChange, onEnvironmentListChange, environmentList, active }: EditorProps) {
  const [state, dispatch] = useReducer(reducer, {
    ...INITIAL_STATE,
    url: (initialRequest && initialRequest.url) || getUrl() || INITIAL_STATE.url,
    interactive: initialRequest ? initialRequest.interactive : (protoInfo && protoInfo.usesStream()) || INITIAL_STATE.interactive,
    grpcWeb: initialRequest ? initialRequest.grpcWeb : INITIAL_STATE.grpcWeb,
    metadata: (initialRequest && initialRequest.metadata) || getMetadata() || INITIAL_STATE.metadata,
    environment: (initialRequest && initialRequest.environment),
  });

  const [editorFontSize, setEditorFontSize] = useState(() => getTabUXSettings().editorFontSize);

  const handleEditorFontSizeChange = (size: number) => {
    setEditorFontSize(size);
    const settings = getTabUXSettings();
    storeTabUXSettings({ ...settings, editorFontSize: size });
  };

  // Keyboard shortcuts for zoom (Cmd/Ctrl + Plus/Minus/0)
  useEffect(() => {
    if (!active) return;

    const zoomIn = () => {
      const currentIndex = EDITOR_FONT_SIZES.indexOf(editorFontSize as typeof EDITOR_FONT_SIZES[number]);
      if (currentIndex < EDITOR_FONT_SIZES.length - 1) {
        handleEditorFontSizeChange(EDITOR_FONT_SIZES[currentIndex + 1]);
      }
      return false;
    };

    const zoomOut = () => {
      const currentIndex = EDITOR_FONT_SIZES.indexOf(editorFontSize as typeof EDITOR_FONT_SIZES[number]);
      if (currentIndex > 0) {
        handleEditorFontSizeChange(EDITOR_FONT_SIZES[currentIndex - 1]);
      }
      return false;
    };

    const resetZoom = () => {
      handleEditorFontSizeChange(13); // Default font size
      return false;
    };

    Mousetrap.bindGlobal(['mod+=', 'mod+plus'], zoomIn);
    Mousetrap.bindGlobal(['mod+-', 'mod+minus'], zoomOut);
    Mousetrap.bindGlobal('mod+0', resetZoom);

    return () => {
      Mousetrap.unbind(['mod+=', 'mod+plus']);
      Mousetrap.unbind(['mod+-', 'mod+minus']);
      Mousetrap.unbind('mod+0');
    };
  }, [active, editorFontSize]);

  useEffect(() => {
    if (protoInfo && !initialRequest) {
      try {
        const { plain } = protoInfo.service.methodsMocks[protoInfo.methodName]();
        dispatch(setData(JSON.stringify(plain, null, 2)));
      } catch (e) {
        console.error(e);
        dispatch(setData(JSON.stringify({
          "error": "Error parsing the request message, please report the problem sharing the offending protofile"
        }, null, 2)));
      }
    }

    if (initialRequest) {
      dispatch(setData(initialRequest.inputs || initialRequest.data));
      dispatch(setMetadata(initialRequest.metadata));
      dispatch(setTSLCertificate(initialRequest.tlsCertificate));
    }
  }, []);

  return (
    <div style={styles.tabContainer}>
      <div style={styles.inputContainer}>
        <div style={{ width: "60%" }}>
          <AddressBar
              protoInfo={protoInfo}
              loading={state.loading}
              url={state.url}
              defaultEnvironment={state.environment}
              environments={environmentList}
              onChangeEnvironment={(environment) => {

                if (!environment) {
                  dispatch(setEnvironment(""));
                  onRequestChange?.({
                    ...state,
                    environment: "",
                  });
                  return;
                }

                dispatch(setUrl(environment.url));
                dispatch(setMetadata(environment.metadata));
                dispatch(setEnvironment(environment.name));
                dispatch(setTSLCertificate(environment.tlsCertificate));
                dispatch(setInteractive(environment.interactive));

                onRequestChange?.({
                  ...state,
                  environment: environment.name,
                  url: environment.url,
                  metadata: environment.metadata,
                  tlsCertificate: environment.tlsCertificate,
                  interactive: environment.interactive,
                });
              }}
              onEnvironmentDelete={(environmentName) => {
                deleteEnvironment(environmentName);
                dispatch(setEnvironment(""));
                onRequestChange?.({
                  ...state,
                  environment: "",
                });
                onEnvironmentListChange?.(
                    getEnvironments()
                );
              }}
              onEnvironmentSave={(environmentName) => {
                saveEnvironment({
                  name: environmentName,
                  url: state.url,
                  interactive: state.interactive,
                  metadata: state.metadata,
                  tlsCertificate: state.tlsCertificate,
                });

                dispatch(setEnvironment(environmentName));
                onRequestChange?.({
                  ...state,
                  environment: environmentName,
                });

                onEnvironmentListChange?.(
                    getEnvironments()
                );
              }}
              onChangeUrl={(e) => {
                dispatch(setUrl(e.target.value));
                storeUrl(e.target.value);
                onRequestChange?.({
                  ...state,
                  url: e.target.value,
                });
              }}
          />
        </div>

        {protoInfo && (
          <Options
            protoInfo={protoInfo}
            dispatch={dispatch}
            grpcWebChecked={state.grpcWeb}
            interactiveChecked={state.interactive}
            onClickExport={async () => {
              await exportResponseToJSONFile(protoInfo, state)
            }}
            onInteractiveChange={(checked) => {
              onRequestChange?.({
                ...state,
                interactive: checked,
              });
            }}
            tlsSelected={state.tlsCertificate}
            onTLSSelected={(certificate) => {
              dispatch(setTSLCertificate(certificate));
              onRequestChange?.({
                ...state,
                tlsCertificate: certificate,
              });
            }}
          />
        )}
      </div>

      <div style={styles.editorContainer}>
        <Resizable
            enable={{ right: true }}
            defaultSize={{
              width: "50%",
            }}
            maxWidth={"80%"}
            minWidth={"10%"}
        >
          <Request
            data={state.data}
            streamData={state.requestStreamData}
            active={active}
            editorFontSize={editorFontSize}
            onChangeData={(value) => {
              dispatch(setData(value));
              onRequestChange?.({
                ...state,
                data: value,
              });
            }}
          />

          <div style={{
            ...styles.playIconContainer,
            ...(isControlVisible(state) ? styles.streamControlsContainer : {}),
          }}>
            <Controls
                active={active}
                dispatch={dispatch}
                state={state}
                protoInfo={protoInfo}
            />
          </div>
        </Resizable>

        <div style={{...styles.responseContainer}}>
          <Response
            streamResponse={state.responseStreamData}
            response={state.response}
            editorFontSize={editorFontSize}
          />
        </div>
      </div>

      <Metadata
        onClickMetadata={() => {
          dispatch(setMetadataVisibilty(!state.metadataOpened));
        }}
        onMetadataChange={(value) => {
          dispatch(setMetadata(value));
          onRequestChange?.({
            ...state,
            metadata: value,
          });
        }}
        value={state.metadata}
        editorFontSize={editorFontSize}
      />

      {protoInfo && (
        <ProtoFileViewer
          protoInfo={protoInfo}
          visible={state.protoViewVisible}
          onClose={() => dispatch(setProtoVisibility(false))}
          editorFontSize={editorFontSize}
        />
      )}
    </div>
  )
}

const styles = {
  tabContainer: {
    width: "100%",
    height: "100%",
    position: "relative" as const,
  },
  editorContainer: {
    display: "flex",
    height: "100%",
    borderLeft: `1px solid ${colors.borderSubtle}`,
    background: colors.white,
  },
  responseContainer: {
    background: colors.white,
    maxWidth: "inherit",
    width: "inherit",
    display: "flex",
    flex: "1 1 0%",
    borderLeft: `1px solid ${colors.borderLight}`,
    borderRight: `1px solid ${colors.borderSubtle}`,
    overflow: "auto",
  },
  playIconContainer: {
    position: "absolute" as const,
    zIndex: zIndex.content,
    right: "-30px",
    marginLeft: "-25px",
    top: "calc(50% - 80px)",
  },
  streamControlsContainer: {
    right: "-42px",
  },
  inputContainer: {
    display: "flex",
    justifyContent: "space-between",
    border: `1px solid ${colors.borderSubtle}`,
    borderBottom: `1px solid ${colors.borderLight}`,
    background: colors.bgPanel,
    padding: `${spacing.base}px`,
    boxShadow: shadow.elevated,
  },
};
