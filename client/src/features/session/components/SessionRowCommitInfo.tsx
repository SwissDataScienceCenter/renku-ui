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

import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { skipToken } from "@reduxjs/toolkit/query";
import cx from "classnames";
import { useRef } from "react";
import { PopoverBody, PopoverHeader, UncontrolledPopover } from "reactstrap";

import { ExternalLink } from "../../../components/ExternalLinks";
import { Loader } from "../../../components/Loader";
import { TimeCaption } from "../../../components/TimeCaption";
import { toHumanDateTime } from "../../../utils/helpers/DateTimeUtils";
import { useGetRepositoryCommitQuery } from "../../project/projectGitLab.api";

interface SessionRowCommitInfoProps {
  commitSha?: string;
  projectId?: string;
}

export default function SessionRowCommitInfo({
  commitSha,
  projectId,
}: SessionRowCommitInfoProps) {
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <>
      <span ref={ref}>
        <FontAwesomeIcon className="cursor-pointer" icon={faInfoCircle} />
      </span>
      <UncontrolledPopover placement="bottom" target={ref} trigger="legacy">
        <SessionRowCommitInfoDetails
          commitSha={commitSha}
          projectId={projectId}
        />
      </UncontrolledPopover>
    </>
  );
}

function SessionRowCommitInfoDetails({
  commitSha = "",
  projectId = "",
}: SessionRowCommitInfoProps) {
  const {
    data: commit,
    isLoading,
    isError,
  } = useGetRepositoryCommitQuery(
    !!commitSha && !!projectId ? { commitSha, projectId } : skipToken
  );

  const content = isLoading ? (
    <span>
      <Loader className="me-1" inline size={16} />
      Fetching data...
    </span>
  ) : isError || !commit ? (
    <span>Data not available.</span>
  ) : (
    <>
      <span className="fw-bold">Author:</span> <span>{commit.author_name}</span>
      <br />
      <span>
        <span className="fw-bold">Date:</span>{" "}
        <span>
          {toHumanDateTime({
            datetime: commit.committed_date,
            format: "full",
          })}
        </span>{" "}
        <TimeCaption datetime={commit.committed_date} prefix="~" />
        <br />
      </span>
      <span className="fw-bold">Message:</span> <span>{commit.message}</span>
      <br />
      <span className="fw-bold">Full SHA:</span> <span>{commit.id}</span>
      <br />
      <span className={cx("fw-bold", "me-1")}>Details:</span>
      <ExternalLink
        role="text"
        showLinkIcon={true}
        title="Open commit in GitLab"
        url={commit.web_url}
      />
    </>
  );

  return (
    <>
      <PopoverHeader>Commit details</PopoverHeader>
      <PopoverBody>{content}</PopoverBody>
    </>
  );
}
