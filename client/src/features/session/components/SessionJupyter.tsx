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

import cx from "classnames";
import { useLocation } from "react-router";
import { appendCustomUrlPath } from "../../../utils/helpers/url";
import { Session } from "../sessions.types";

interface SessionJupyterProps {
  height: string;
  isSessionReady: boolean;
  session: Session;
}

export default function SessionJupyter({
  height,
  isSessionReady,
  session,
}: SessionJupyterProps) {
  const location = useLocation<{ filePath?: string } | undefined>();

  if (session.status.state !== "running") {
    return null;
  }

  const locationFilePath = location.state?.filePath;
  const notebookUrl = locationFilePath
    ? appendCustomUrlPath({
        notebookUrl: session.url,
        customUrlPath: `/lab/tree/${locationFilePath}`,
      })
    : session.url;

  const style = !isSessionReady
    ? ({
        position: "absolute",
        top: 0,
        visibility: "hidden",
      } as const)
    : {};

  return (
    <iframe
      className={cx("d-block", "w-100")}
      height={height}
      id="session-iframe"
      referrerPolicy="origin"
      sandbox="allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
      src={notebookUrl}
      style={style}
      title="session iframe"
    />
  );
}
