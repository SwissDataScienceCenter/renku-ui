/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */

import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useCallback, useState } from "react";
import { XLg } from "react-bootstrap-icons";
import { Link } from "react-router-dom-v5-compat";
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
import {
  useGetResourceClassByIdQuery,
  useGetResourcePoolsQuery,
} from "../../../dataServices/computeResources.api";
import { ResourceClass } from "../../../dataServices/dataServices.types";
import { SessionRowResourceRequests } from "../../../session/components/SessionsList";
import { SessionClassSelectorV2 } from "../../../session/components/options/SessionClassOption";
import {
  ErrorOrNotAvailableResourcePools,
  FetchingResourcePools,
} from "./ResourceClassWarning";
import {
  MIN_SESSION_STORAGE_GB,
  STEP_SESSION_STORAGE_GB,
} from "../../../session/startSessionOptions.constants";

interface SelectResourceClassModalProps {
  isOpen: boolean;
  onContinue: (env: ResourceClass, diskStorage: number | undefined) => void;
  projectUrl: string;
  resourceClassId?: number;
  isCustom: boolean;
}
export function SelectResourceClassModal({
  isOpen,
  onContinue,
  projectUrl,
  resourceClassId,
  isCustom,
}: SelectResourceClassModalProps) {
  const {
    data: resourcePools,
    isLoading,
    isError,
  } = useGetResourcePoolsQuery({});

  const [currentSessionClass, setCurrentSessionClass] = useState<
    ResourceClass | undefined
  >(undefined);
  const [currentDiskStorage, setCurrentDiskStorage] = useState<
    number | undefined
  >(undefined);

  const { data: launcherClass, isLoading: isLoadingLauncherClass } =
    useGetResourceClassByIdQuery(resourceClassId ?? skipToken);

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

  const onClick = useCallback(() => {
    if (currentSessionClass) {
      onContinue(currentSessionClass, currentDiskStorage);
    }
  }, [currentDiskStorage, currentSessionClass, onContinue]);

  const selector = isLoading ? (
    <FetchingResourcePools />
  ) : !resourcePools || resourcePools.length == 0 || isError ? (
    <ErrorOrNotAvailableResourcePools />
  ) : (
    <SessionClassSelectorV2
      resourcePools={resourcePools}
      currentSessionClass={currentSessionClass}
      onChange={onChange}
    />
  );

  const resourceDetails =
    !isLoadingLauncherClass && launcherClass ? (
      <SessionRowResourceRequests
        resourceRequests={{
          cpu: launcherClass.cpu,
          memory: `${launcherClass.memory}G`,
          storage: `${launcherClass.default_storage}G`,
          gpu: launcherClass.gpu,
        }}
      />
    ) : (
      <p>Resource class not available</p>
    );

  return (
    <Modal centered isOpen={isOpen} size="lg">
      <ModalHeader>
        {isCustom
          ? "Modify session launch before start"
          : "Complete missing information for session launch"}
      </ModalHeader>
      <ModalBody>
        {isCustom ? (
          <p>
            Please select one of your available resource classes to continue.
          </p>
        ) : (
          <p>
            You do not have access to the default resource class of this session
            launcher. Please select one of your available resource classes to
            continue.
          </p>
        )}
        {launcherClass && (
          <p>
            <span className={cx("fw-bold", "me-3")}>
              Original requested resources:
            </span>
            <span>{resourceDetails}</span>
          </p>
        )}
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
                    className={cx(
                      currentDiskStorage > currentSessionClass.max_storage &&
                        "is-invalid"
                    )}
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
      <ModalFooter className="gap-2">
        <Link
          className={cx("btn", "btn-outline-primary")}
          to={projectUrl}
          data-cy="start-session-button"
        >
          <XLg className={cx("bi", "me-1")} />
          Cancel launch
        </Link>
        <Button
          color="primary"
          disabled={
            !currentSessionClass ||
            (currentDiskStorage != null &&
              currentDiskStorage > currentSessionClass.max_storage)
          }
          onClick={onClick}
        >
          Continue
        </Button>
      </ModalFooter>
    </Modal>
  );
}
