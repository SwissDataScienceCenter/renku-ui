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
import { useEffect, useRef, useState } from "react";

import { ErrorAlert } from "../../../components/Alert";
import { Loader } from "../../../components/Loader";
import { ensureHTTPS } from "../session.utils";
import { SessionV2 } from "../sessionsV2.types";

interface SessionIframeProps {
  height: string;
  session: SessionV2;
}

export default function SessionIframe({
  height,
  session: { status, url },
}: SessionIframeProps) {
  const ref = useRef<HTMLIFrameElement>(null);

  const [{ isError, hasLoaded }, setState] = useState<SessionIframeState>({
    isError: false,
    hasLoaded: false,
  });

  // ? This effect will reload the iframe if it detects a 503 error.
  useEffect(() => {
    if (hasLoaded) {
      return;
    }
    const checkIframe = window.setInterval(() => {
      if (ref.current == null) {
        return;
      }
      const headText =
        ref.current.contentDocument?.head?.querySelector?.("title")
          ?.textContent ?? "";
      if (headText.includes("503 Service Temporarily Unavailable")) {
        setState({ isError: true, hasLoaded: false });
        ref.current?.contentDocument?.location.reload();
      } else {
        setState({ isError: false, hasLoaded: true });
      }
    }, 1_000);
    return () => {
      window.clearInterval(checkIframe);
    };
  }, [hasLoaded]);

  if (status.state !== "running") {
    return null;
  }

  try {
    const secureUrl = ensureHTTPS(url);
    return (
      <>
        {isError && (
          <p className={cx("mx-3", "my-1")}>
            <Loader className="me-1" inline size={16} />
            Reloading window...
          </p>
        )}
        <iframe
          className={cx("d-block", "w-100")}
          data-cy="session-iframe"
          height={height}
          id="session-iframe"
          ref={ref}
          referrerPolicy="origin"
          sandbox="allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
          src={secureUrl}
          title="session iframe"
        />
      </>
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

type SessionIframeState = {
  isError: boolean;
  hasLoaded: boolean;
};
