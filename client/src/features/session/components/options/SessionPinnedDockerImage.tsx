/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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
 * limitations under the License.
 */

import {
  faExclamationTriangle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Collapse, FormText, Input } from "reactstrap";

import { ExternalLink } from "../../../../components/ExternalLinks";
import { Loader } from "../../../../components/Loader";
import { Docs } from "../../../../utils/constants/Docs";
import useAppDispatch from "../../../../utils/customHooks/useAppDispatch.hook";
import useAppSelector from "../../../../utils/customHooks/useAppSelector.hook";
import { useGetDockerImageQuery } from "../../sessions.api";
import { SESSION_CI_PIPELINE_POLLING_INTERVAL_MS } from "../../startSessionOptions.constants";
import { DockerImageStatus } from "../../startSessionOptions.types";
import {
  setDockerImageStatus,
  setPinnedDockerImage,
} from "../../startSessionOptionsSlice";

interface SessionPinnedDockerImageProps {
  dockerImage: string;
}

export default function SessionPinnedDockerImage({
  dockerImage,
}: SessionPinnedDockerImageProps) {
  const status = useAppSelector(
    ({ startSessionOptions }) => startSessionOptions.dockerImageStatus
  );

  const { data: dockerImageStatus, isLoading } = useGetDockerImageQuery(
    {
      image: dockerImage,
    },
    {
      pollingInterval:
        status === "not-available"
          ? SESSION_CI_PIPELINE_POLLING_INTERVAL_MS
          : 0,
    }
  );

  const [show, setShow] = useState<boolean>(false);
  const toggleShow = useCallback(() => setShow((show) => !show), []);

  const dispatch = useAppDispatch();

  // Set the pinned image option
  useEffect(() => {
    dispatch(setPinnedDockerImage(dockerImage));
  }, [dispatch, dockerImage]);

  // Set the image status
  useEffect(() => {
    const newStatus: DockerImageStatus = isLoading
      ? "unknown"
      : dockerImageStatus == null
      ? "not-available"
      : dockerImageStatus.available
      ? "available"
      : "not-available";
    if (newStatus !== status) {
      dispatch(setDockerImageStatus(newStatus));
    }
  }, [dispatch, dockerImageStatus, isLoading, status]);

  if (status === "unknown") {
    return (
      <div className="field-group">
        <div className="form-label">
          <Loader className="me-1" inline size={16} />
          Loading Docker image status...
        </div>
      </div>
    );
  }

  const moreInfoButton = (
    <Button
      className={cx("ms-3", "p-0", "btn-sm")}
      color="link"
      onClick={toggleShow}
    >
      more info
    </Button>
  );
  const pinnedImagesDoc = (
    <ExternalLink
      role="text"
      iconSup={true}
      iconAfter={true}
      url={Docs.rtdReferencePage("templates.html#pin-a-docker-image")}
      title="pinned image"
    />
  );
  const badge =
    status === "not-available" ? (
      <Badge color="danger">pinned not available</Badge>
    ) : (
      <Badge color="success">pinned available</Badge>
    );
  const moreInfo =
    status === "not-available" ? (
      <>
        <FontAwesomeIcon icon={faExclamationTriangle} className="text-danger" />{" "}
        Pinned Docker image not found. Since this project specifies a{" "}
        {pinnedImagesDoc}, it is unlikely to work with a base image.
      </>
    ) : (
      <>
        <Input
          type="text"
          disabled={true}
          id="customImage"
          value={dockerImage}
        ></Input>
        <FormText>
          <FontAwesomeIcon icon={faInfoCircle} /> This project specifies a{" "}
          {pinnedImagesDoc}. A pinned image has advantages for projects with
          many forks, but it will not reflect changes to the{" "}
          <code>Dockerfile</code> or any project dependency files.
        </FormText>
      </>
    );

  return (
    <div className="field-group">
      <div className="form-label">
        Docker image {badge}
        {moreInfoButton}
        <Collapse isOpen={show}>
          <div className="mt-3">{moreInfo}</div>
        </Collapse>
      </div>
    </div>
  );
}
