import {
  Button,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from "reactstrap";
import { useCallback, useEffect, useState } from "react";
import { useGetResourcePoolsQuery } from "../../../dataServices/dataServices.api.ts";
import { ResourceClass } from "../../../dataServices/dataServices.types.ts";
import { SingleValue } from "react-select";
import { ErrorAlert, SuccessAlert } from "../../../../components/Alert.jsx";
import { Loader } from "../../../../components/Loader.tsx";
import cx from "classnames";
import { SessionClassSelector } from "../../../session/components/options/SessionClassOption.tsx";
import { CheckLg, XLg } from "react-bootstrap-icons";
import { useUpdateSessionLauncherMutation } from "../../sessionsV2.api.ts";

interface ModifyResourcesLauncherModalProps {
  isOpen: boolean;
  toggleModal: () => void;
  resourceClassId: number;
  sessionLauncherId: string;
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
    <div className="form-label">
      <Loader className="me-1" inline size={16} />
      Fetching available resource pools...
    </div>
  ) : !resourcePools || resourcePools.length == 0 || isErrorResources ? (
    <ErrorAlert dismissible={false}>
      <h3 className={cx("fs-6", "fw-bold")}>
        Error on loading available session resource pools
      </h3>
      <p className="mb-0">
        Modifying the resources is not possible at the moment. You can try to{" "}
        <a
          className={cx("btn", "btn-sm", "btn-primary", "mx-1")}
          href={window.location.href}
          onClick={() => window.location.reload()}
        >
          reload the page
        </a>
        .
      </p>
    </ErrorAlert>
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
      <ModalHeader toggle={toggleModal}>Modify Launcher Resources</ModalHeader>
      <ModalBody className="py-0">
        <Row>
          <Col>
            {result.error && (
              <ErrorAlert dismissible={false}>
                <h3 className={cx("fs-6", "fw-bold")}>
                  Error modifying resources
                </h3>
                <p className="mb-0">
                  Modifying the resources is not possible at the moment. You can
                  try to{" "}
                  <a
                    className={cx("btn", "btn-sm", "btn-primary", "mx-1")}
                    href={window.location.href}
                    onClick={() => window.location.reload()}
                  >
                    reload the page
                  </a>
                  .
                </p>
              </ErrorAlert>
            )}
            {result.isSuccess && (
              <SuccessAlert dismissible={false}>
                <h3 className={cx("fs-6", "fw-bold")}>
                  Resources modified successfully
                </h3>
                <p className="mb-0">
                  The Session launcher resources has been changed. It apply next
                  time you launch a session.
                </p>
              </SuccessAlert>
            )}
            <p>
              These changes will apply the next time you launch a session. For
              the <strong>current running session of this launcher</strong>, you
              can modify resources when the session is hibernating or paused in
              the session options.
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
