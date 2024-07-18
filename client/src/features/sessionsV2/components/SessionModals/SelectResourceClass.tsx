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
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
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

interface SelectResourceClassModalProps {
  isOpen: boolean;
  onContinue: (env: ResourceClass) => void;
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

  const { data: launcherClass, isLoading: isLoadingLauncherClass } =
    useGetResourceClassByIdQuery(resourceClassId ?? skipToken);

  const onChange = useCallback((newValue: SingleValue<ResourceClass>) => {
    if (newValue) {
      setCurrentSessionClass(newValue);
    }
  }, []);

  const onClick = useCallback(() => {
    if (currentSessionClass) {
      onContinue(currentSessionClass);
    }
  }, [currentSessionClass, onContinue]);

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
          storage: `${launcherClass.max_storage}G`,
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
            continue.”
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
      </ModalBody>
      <ModalFooter className="gap-2">
        <Link
          className={cx("btn", "btn-outline-primary")}
          to={projectUrl}
          data-cy="start-session-button"
        >
          <XLg className={cx("me-2", "text-icon")} />
          Cancel launch
        </Link>
        <Button
          color="primary"
          disabled={!currentSessionClass}
          onClick={onClick}
        >
          Continue
        </Button>
      </ModalFooter>
    </Modal>
  );
}
