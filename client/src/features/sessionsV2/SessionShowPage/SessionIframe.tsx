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
 * limitations under the License.
 */

import cx from "classnames";
import { ErrorAlert } from "../../../components/Alert";
import { ensureHTTPS } from "../session.utils";
import { SessionV2 } from "../sessionsV2.types";

const getIframeStyle = (isSessionReady: boolean): React.CSSProperties => {
  return !isSessionReady
    ? {
        position: "absolute",
        top: 0,
        visibility: "hidden",
      }
    : {};
};

interface SessionIframeProps {
  height: string;
  isSessionReady: boolean;
  session: SessionV2;
}

export default function SessionIframe({
  height,
  isSessionReady,
  session: { status, url },
}: SessionIframeProps) {
  if (status.state !== "running") return null;

  const style = getIframeStyle(isSessionReady);

  try {
    const secureUrl = ensureHTTPS(url);
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
  } catch (error) {
    return (
      <ErrorAlert>
        {error instanceof Error
          ? error.message
          : "An error occurred loading session URL"}
      </ErrorAlert>
    );
  }
}
