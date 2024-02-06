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

import { WarnAlert } from "../../../components/Alert";
import { Loader } from "../../../components/Loader";
import { NotebookAnnotations } from "../../../notebooks/components/session.types";
import { SessionStatusState } from "../sessions.types";
import { useGitStatusQuery } from "../sidecar.api";

interface UnsavedWorkWarningProps {
  annotations: NotebookAnnotations;
  sessionName: string;
  status: SessionStatusState;
}

export default function UnsavedWorkWarning({
  annotations,
  sessionName,
  status,
}: UnsavedWorkWarningProps) {
  if (status === "hibernated") {
    return <HibernatedUnsavedWorkWarning annotations={annotations} />;
  }

  if (status === "running") {
    return <RunningUnsavedWorkWarning sessionName={sessionName} />;
  }

  const hasHibernationInfo = !!annotations["hibernationDate"];
  const hasUnsavedWork =
    !hasHibernationInfo ||
    annotations["hibernationDirty"] ||
    !annotations["hibernationSynchronized"];

  if (!hasUnsavedWork) {
    return null;
  }

  const explanation = !hasHibernationInfo
    ? "uncommitted files and/or unsynced commits"
    : annotations["hibernationDirty"] && !annotations["hibernationSynchronized"]
    ? "uncommitted files and unsynced commits"
    : annotations["hibernationDirty"]
    ? "uncommitted files"
    : "unsynced commits";

  return (
    <WarnAlert dismissible={false}>
      You may have unsaved work {"("}
      {explanation}
      {")"} in this session
    </WarnAlert>
  );
}

type HibernatedUnsavedWorkWarningProps = Pick<
  UnsavedWorkWarningProps,
  "annotations"
>;

function HibernatedUnsavedWorkWarning({
  annotations,
}: HibernatedUnsavedWorkWarningProps) {
  const hasHibernationInfo = !!annotations["hibernationDate"];
  const hasUnsavedWork =
    !hasHibernationInfo ||
    annotations["hibernationDirty"] ||
    !annotations["hibernationSynchronized"];

  if (!hasUnsavedWork) {
    return null;
  }

  const explanation = !hasHibernationInfo
    ? "uncommitted files and/or unsynced commits"
    : annotations["hibernationDirty"] && !annotations["hibernationSynchronized"]
    ? "uncommitted files and unsynced commits"
    : annotations["hibernationDirty"]
    ? "uncommitted files"
    : "unsynced commits";

  return (
    <WarnAlert dismissible={false}>
      You have unsaved work {"("}
      {explanation}
      {")"} in this session
    </WarnAlert>
  );
}

type RunningUnsavedWorkWarningProps = Pick<
  UnsavedWorkWarningProps,
  "sessionName"
>;

function RunningUnsavedWorkWarning({
  sessionName,
}: RunningUnsavedWorkWarningProps) {
  const { data, error, isFetching } = useGitStatusQuery({
    serverName: sessionName,
  });

  if (isFetching) {
    return (
      <div>
        <Loader className="me-1" inline size={16} /> Loading session status...
      </div>
    );
  }

  if (
    data != null &&
    data.error == null &&
    data.result.ahead == 0 &&
    data.result.clean
  ) {
    return null;
  }

  const explanation =
    error || data == null || data.error != null
      ? "uncommitted files and/or unsynced commits"
      : data.result.ahead > 0 && !data.result.clean
      ? "uncommitted files and unsynced commits"
      : !data.result.clean
      ? "uncommitted files"
      : "unsynced commits";

  return (
    <WarnAlert dismissible={false}>
      You {error || data == null || (data.error != null && <>may </>)} have
      unsaved work {"("}
      {explanation}
      {")"} in this session
    </WarnAlert>
  );
}
