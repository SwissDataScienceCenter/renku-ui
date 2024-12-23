import cx from "classnames";
import { useCallback, useEffect, useState } from "react";
import { CheckLg, XLg } from "react-bootstrap-icons";
import { SingleValue } from "react-select";
import {
  Button,
  FormText,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  UncontrolledTooltip,
} from "reactstrap";
import { SuccessAlert } from "../../../../components/Alert";
import { Loader } from "../../../../components/Loader";
import { useGetResourcePoolsQuery } from "../../../dataServices/computeResources.api";
import { ResourceClass } from "../../../dataServices/dataServices.types";
import { SessionClassSelectorV2 } from "../../../session/components/options/SessionClassOption";
import { useUpdateSessionLauncherMutation } from "../../sessionsV2.api";
import {
  ErrorOrNotAvailableResourcePools,
  FetchingResourcePools,
} from "./ResourceClassWarning";
import {
  MIN_SESSION_STORAGE_GB,
  STEP_SESSION_STORAGE_GB,
} from "../../../session/startSessionOptions.constants";

interface ModifyResourcesLauncherModalProps {
  isOpen: boolean;
  toggleModal: () => void;
  resourceClassId?: number;
  diskStorage?: number;
  sessionLauncherId: string;
}

export function ModifyResourcesLauncherModal({
  isOpen,
  sessionLauncherId,
  toggleModal,
  resourceClassId,
  diskStorage,
}: ModifyResourcesLauncherModalProps) {
  const [updateSessionLauncher, result] = useUpdateSessionLauncherMutation();
  const {
    data: resourcePools,
    isLoading: isLoadingResources,
    isError: isErrorResources,
  } = useGetResourcePoolsQuery({});

  const [currentSessionClass, setCurrentSessionClass] = useState<
    ResourceClass | undefined
  >(undefined);
  const [currentDiskStorage, setCurrentDiskStorage] = useState<
    number | undefined
  >(undefined);

  const isDirty =
    (resourceClassId == null && currentSessionClass?.id != null) ||
    (resourceClassId != null && resourceClassId !== currentSessionClass?.id) ||
    (diskStorage == null && currentDiskStorage != null) ||
    (diskStorage != null && diskStorage != currentDiskStorage);

  const onChange = useCallback((newValue: SingleValue<ResourceClass>) => {
    if (newValue) {
      setCurrentSessionClass(newValue);
    }
  }, []);
  const onChangeDiskStorage = useCallback((newValue: number | null) => {
    if (newValue) {
      setCurrentDiskStorage(newValue);
    } else {
      setCurrentDiskStorage(undefined);
    }
  }, []);
  const toggleDiskStorage = useCallback(() => {
    setCurrentDiskStorage((oldValue) => {
      if (oldValue == null && currentSessionClass) {
        return currentSessionClass.default_storage;
      }
      return undefined;
    });
  }, [currentSessionClass]);

  const onModifyResources = useCallback(() => {
    if (currentSessionClass) {
      updateSessionLauncher({
        launcherId: sessionLauncherId,
        resource_class_id: currentSessionClass?.id,
        disk_storage: currentDiskStorage ?? null,
      });
    }
  }, [
    sessionLauncherId,
    updateSessionLauncher,
    currentDiskStorage,
    currentSessionClass,
  ]);

  useEffect(() => {
    const currentSessionClass = resourcePools
      ?.flatMap((pool) => pool.classes)
      .find((c) => c.id === resourceClassId);
    setCurrentSessionClass(currentSessionClass);
  }, [resourceClassId, resourcePools]);

  useEffect(() => {
    setCurrentDiskStorage(diskStorage);
  }, [diskStorage]);

  useEffect(() => {
    if (!isOpen) {
      const currentSessionClass = resourcePools
        ?.flatMap((pool) => pool.classes)
        .find((c) => c.id === resourceClassId);
      setCurrentSessionClass(currentSessionClass);
      setCurrentDiskStorage(diskStorage);
    }
  }, [diskStorage, isOpen, resourceClassId, resourcePools]);

  const selector = isLoadingResources ? (
    <FetchingResourcePools />
  ) : !resourcePools || resourcePools.length == 0 || isErrorResources ? (
    <ErrorOrNotAvailableResourcePools />
  ) : (
    <SessionClassSelectorV2
      resourcePools={resourcePools}
      currentSessionClass={currentSessionClass}
      onChange={onChange}
    />
  );
  return (
    <Modal
      centered
      fullscreen="lg"
      isOpen={isOpen}
      size="lg"
      toggle={toggleModal}
    >
      <ModalHeader toggle={toggleModal}>Set default resource class</ModalHeader>
      <ModalBody>
        {result.error && (
          <ErrorOrNotAvailableResourcePools title="Error modifying resources" />
        )}
        {result.isSuccess && (
          <SuccessAlert dismissible={false}>
            <h3 className={cx("fs-6", "fw-bold")}>
              Default resource class updated
            </h3>
            <p className="mb-0">
              The session launcher’s default resource class has been changed.
              This change will apply the next time you launch a new session.
            </p>
          </SuccessAlert>
        )}
        <p>
          These changes will apply the{" "}
          <strong>next time you launch a new session</strong>. If you wish to
          modify a currently running session, pause it and select ‘Modify
          session’ in the session options.
        </p>
        <div className="field-group">{selector}</div>
        {currentSessionClass && (
          <div className={cx("field-group", "mt-3")}>
            <div>
              Disk Storage:{" "}
              <span className="fw-bold">
                {currentDiskStorage ? (
                  <>{currentDiskStorage} GB</>
                ) : (
                  <>{currentSessionClass?.default_storage} GB (default)</>
                )}
              </span>
            </div>
            <div className={cx("form-check", "form-switch")}>
              <Input
                type="checkbox"
                role="switch"
                id="configure-disk-storage"
                checked={currentDiskStorage != null}
                onChange={toggleDiskStorage}
              />
              <Label for="configure-disk-storage">Configure disk storage</Label>
            </div>
            {currentDiskStorage != null && (
              <>
                <InputGroup>
                  <Input
                    type="number"
                    min={MIN_SESSION_STORAGE_GB}
                    max={currentSessionClass?.max_storage}
                    step={STEP_SESSION_STORAGE_GB}
                    value={currentDiskStorage}
                    onChange={(event) => {
                      onChangeDiskStorage(event.target.valueAsNumber);
                    }}
                  />
                  <InputGroupText id="configure-disk-storage-addon">
                    GB
                  </InputGroupText>
                  <UncontrolledTooltip target="configure-disk-storage-addon">
                    Gigabytes
                  </UncontrolledTooltip>
                </InputGroup>
                <FormText>
                  Default: {currentSessionClass?.default_storage} GB, max:{" "}
                  {currentSessionClass?.max_storage} GB
                </FormText>
              </>
            )}
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color="outline-primary" onClick={toggleModal}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="primary"
          disabled={
            isLoadingResources ||
            !resourcePools ||
            resourcePools.length == 0 ||
            isErrorResources ||
            !isDirty
          }
          onClick={onModifyResources}
          type="submit"
        >
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <CheckLg className={cx("bi", "me-1")} />
          )}
          Modify resources
        </Button>
      </ModalFooter>
    </Modal>
  );
}
