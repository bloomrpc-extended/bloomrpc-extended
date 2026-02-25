import { Icon, Input, Modal, Select } from "antd";
import { RequestType } from "./RequestType";
import { ChangeEvent, useState } from "react";
import { ProtoInfo } from "../../behaviour";
import { EditorEnvironment } from "./Editor";
import { useCloseAnimation } from '../../hooks/useCloseAnimation';

export interface AddressBarProps {
  loading: boolean
  url: string
  environments?: EditorEnvironment[]
  protoInfo?: ProtoInfo
  onChangeUrl?: (e: ChangeEvent<HTMLInputElement>) => void
  defaultEnvironment?: string
  onChangeEnvironment?: (environment?: EditorEnvironment) => void
  onEnvironmentSave?: (name: string) => void
  onEnvironmentDelete?: (name: string) => void
}

export function AddressBar({loading, url, onChangeUrl, protoInfo, defaultEnvironment, environments, onEnvironmentSave, onChangeEnvironment, onEnvironmentDelete}: AddressBarProps) {
  const [currentEnvironmentName, setCurrentEnvironmentName] = useState<string>(defaultEnvironment || "");
  const [newEnvironmentName, setNewEnvironmentName] = useState<string>("");

  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const { shouldRender: saveRender, closing: saveClosing } = useCloseAnimation(saveModalVisible);
  const { shouldRender: updateRender, closing: updateClosing } = useCloseAnimation(updateModalVisible);
  const { shouldRender: deleteRender, closing: deleteClosing } = useCloseAnimation(deleteModalVisible);

  function handleSave() {
    if (newEnvironmentName) {
      setCurrentEnvironmentName(newEnvironmentName);
      onEnvironmentSave?.(newEnvironmentName);
    } else {
      onEnvironmentSave?.(currentEnvironmentName);
    }
    setSaveModalVisible(false);
    setNewEnvironmentName("");
  }

  function handleUpdate() {
    onEnvironmentSave?.(currentEnvironmentName);
    setUpdateModalVisible(false);
  }

  function handleDelete() {
    onEnvironmentDelete?.(currentEnvironmentName);
    setDeleteModalVisible(false);
    setCurrentEnvironmentName("");
  }

  return (
      <>
        <Input.Group compact style={{width: "100%"}}>
          <Select
              defaultValue={currentEnvironmentName}
              value={currentEnvironmentName || undefined}
              placeholder={"Env"}
              style={{width: "20%"}}
              dropdownMatchSelectWidth={false}
              dropdownStyle={{ minWidth: 200 }}
              onSelect={(value: string) => {
                if (value === "new") {
                  setSaveModalVisible(true);
                  return;
                }

                if (value === "update") {
                  setUpdateModalVisible(true);
                  return;
                }

                if (value === "delete") {
                  setDeleteModalVisible(true);
                  return;
                }

                setCurrentEnvironmentName(value);

                const selectedEnv = (environments || []).find(env => env.name === value);
                onChangeEnvironment?.(selectedEnv);
              }}
          >
            <Select.Option value={""}>None</Select.Option>
            {(environments || []).map(env => (
              <Select.Option key={env.name} value={env.name}>{env.name}</Select.Option>
            ))}
            {currentEnvironmentName ? <Select.Option value="update"><Icon type="edit" /> Update Environment</Select.Option> : null}
            {currentEnvironmentName ? <Select.Option value="delete"><Icon type="delete" /> Delete Environment</Select.Option> : null}
            <Select.Option value="new"><Icon type="plus-circle" /> Save New Environment</Select.Option>
          </Select>
          <Input
              style={{width: "80%"}}
              className="server-url"
              addonAfter={(
                  <div style={{display: "flex", alignItems: "center", width: "125px"}}>
                    {loading ? <Icon type="loading" /> : <Icon type="database" />}
                    <RequestType protoInfo={protoInfo} />
                  </div>
              )}
              value={url}
              onChange={onChangeUrl}/>
        </Input.Group>

        <Modal
          title="Environment Name"
          transitionName="" maskTransitionName=""
          visible={saveRender}
          wrapClassName={saveClosing ? 'modal-closing' : ''}
          onOk={handleSave}
          onCancel={() => { setSaveModalVisible(false); setNewEnvironmentName(""); }}
          okText="Confirm"
          cancelText="Cancel"
        >
          <Input
            autoFocus
            required
            placeholder="Staging"
            value={newEnvironmentName}
            onChange={(e) => setNewEnvironmentName(e.target.value)}
          />
        </Modal>

        <Modal
          title={`Update ${currentEnvironmentName}?`}
          transitionName="" maskTransitionName=""
          visible={updateRender}
          wrapClassName={updateClosing ? 'modal-closing' : ''}
          onOk={handleUpdate}
          onCancel={() => setUpdateModalVisible(false)}
          okText="Confirm"
          cancelText="Cancel"
        >
          Do you want to update the environment?
        </Modal>

        <Modal
          title={`Delete ${currentEnvironmentName}?`}
          transitionName="" maskTransitionName=""
          visible={deleteRender}
          wrapClassName={deleteClosing ? 'modal-closing' : ''}
          onOk={handleDelete}
          onCancel={() => setDeleteModalVisible(false)}
          okText="Confirm"
          cancelText="Cancel"
        >
          Are you sure you want to delete the environment?
        </Modal>
      </>
  )
}
