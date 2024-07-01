import cx from "classnames";
import { useCallback, useEffect, useState } from "react";
import { CheckLg, XLg } from "react-bootstrap-icons";
import { SingleValue } from "react-select";
import {
  Button,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
import { SuccessAlert } from "../../../../components/Alert";
import { Loader } from "../../../../components/Loader";
import { useGetResourcePoolsQuery } from "../../../dataServices/computeResources.api";
import { ResourceClass } from "../../../dataServices/dataServices.types";
import { SessionClassSelector } from "../../../session/components/options/SessionClassOption";
import { useUpdateSessionLauncherMutation } from "../../sessionsV2.api";
import {
  ErrorOrNotAvailableResourcePools,
  FetchingResourcePools,
} from "./ResourceClassWarning";

interface ModifyResourcesLauncherModalProps {
  isOpen: boolean;
  toggleModal: () => void;
  resourceClassId?: number;
  sessionLauncherId?: string;
}

export function ModifyResourcesLauncherModal({
  isOpen,
  sessionLauncherId,
  toggleModal,
  resourceClassId,
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

  const onChange = useCallback((newValue: SingleValue<ResourceClass>) => {
    if (newValue) {
      setCurrentSessionClass(newValue);
    }
  }, []);

  const onModifyResources = useCallback(() => {
    if (currentSessionClass) {
      updateSessionLauncher({
        launcherId: sessionLauncherId,
        resource_class_id: currentSessionClass?.id,
      });
    }
  }, [sessionLauncherId, updateSessionLauncher, currentSessionClass]);

  useEffect(() => {
    const currentSessionClass = resourcePools
      ?.flatMap((pool) => pool.classes)
      .find((c) => c.id === resourceClassId);
    setCurrentSessionClass(currentSessionClass);
  }, [resourceClassId, resourcePools]);

  const selector = isLoadingResources ? (
    <FetchingResourcePools />
  ) : !resourcePools || resourcePools.length == 0 || isErrorResources ? (
    <ErrorOrNotAvailableResourcePools />
  ) : (
    <SessionClassSelector
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
      <ModalBody className="py-0">
        <Row>
          <Col>
            {result.error && (
              <ErrorOrNotAvailableResourcePools title="Error modifying resources" />
            )}
            {result.isSuccess && (
              <SuccessAlert dismissible={false}>
                <h3 className={cx("fs-6", "fw-bold")}>
                  Default resource class updated
                </h3>
                <p className="mb-0">
                  The session launcher’s default resource class has been
                  changed. This change will apply the next time you launch a new
                  session.
                </p>
              </SuccessAlert>
            )}
            <p>
              These changes will apply the{" "}
              <strong>next time you launch a new session</strong>. If you wish
              to modify a currently running session, pause it and select ‘Modify
              session’ in the session options.
            </p>
            <div className="field-group">{selector}</div>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button
          disabled={
            isLoadingResources ||
            !resourcePools ||
            resourcePools.length == 0 ||
            isErrorResources ||
            currentSessionClass == null ||
            (resourceClassId != null &&
              resourceClassId === currentSessionClass?.id)
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
        <Button className="btn-outline-rk-green" onClick={toggleModal}>
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
