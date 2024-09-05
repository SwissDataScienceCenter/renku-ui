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
import { SessionV2 } from "../sessionsV2.types";

interface SessionFrameProps {
  height: string;
  isSessionReady: boolean;
  session: SessionV2;
}

export default function SessionFrame({
  height,
  isSessionReady,
  session,
}: SessionFrameProps) {
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

  const secureUrl = ensureHttps(notebookUrl);

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
      src={secureUrl}
      style={style}
      title="session iframe"
    />
  );
}

function ensureHttps(url: string): string {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:") {
      parsedUrl.protocol = "https:";
    }
    return parsedUrl.toString();
  } catch (error) {
    return url; // Return the original URL if it's invalid
  }
}
