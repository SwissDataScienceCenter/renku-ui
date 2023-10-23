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
import { LocationDescriptor } from "history";
import { ReactNode, useRef } from "react";
import { RootStateOrAny, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { UncontrolledTooltip } from "reactstrap";
import { Loader } from "../../../components/Loader";
import JupyterIcon from "../../../components/icons/JupyterIcon";
import { NotebooksHelper } from "../../../notebooks";
import { NotebookAnnotations } from "../../../notebooks/components/session.types";
import { Url } from "../../../utils/helpers/url";
import { useGetSessionsQuery } from "../sessions.api";
import { SessionStatusStateEnum } from "../sessions.types";
import { getRunningSession } from "../sessions.utils";

interface SessionFileButtonProps {
  filePath: string;
}

export default function SessionFileButton({
  filePath,
}: SessionFileButtonProps) {
  const location = useLocation();

  const projectPathWithNamespace = useSelector<RootStateOrAny, string>(
    (state) => state.stateModel.project.metadata.pathWithNamespace
  );
  const sessionStartUrl = Url.get(Url.pages.project.session.new, {
    namespace: "",
    path: projectPathWithNamespace,
  });
  const sessionAutostartUrl = Url.get(Url.pages.project.session.autostart, {
    namespace: "",
    path: projectPathWithNamespace,
  });

  const { data: sessions, isLoading } = useGetSessionsQuery();

  const runningSession = sessions
    ? getRunningSession({ autostartUrl: sessionAutostartUrl, sessions })
    : null;

  if (isLoading) {
    return <Loader size={19} inline />;
  }

  if (runningSession == null) {
    const target = {
      pathname: sessionStartUrl,
      search: new URLSearchParams({
        autostart: "1",
        notebook: filePath,
      }).toString(),
      state: { successUrl: location.pathname },
    };

    return (
      <SessionFileButtonComponent
        target={target}
        tooltip="Start a session and open this notebook"
      />
    );
  }

  const status = runningSession.status.state;

  if (
    status === SessionStatusStateEnum.running ||
    status === SessionStatusStateEnum.hibernated
  ) {
    const annotations = NotebooksHelper.cleanAnnotations(
      runningSession.annotations
    ) as NotebookAnnotations;
    const sessionUrl = Url.get(Url.pages.project.session.show, {
      namespace: annotations["namespace"],
      path: annotations["projectName"],
      server: runningSession.name,
    });
    const target = {
      pathname: sessionUrl,
      state: { from: location.pathname, filePath },
    };

    return (
      <SessionFileButtonComponent
        hasOrangeAccent
        target={target}
        tooltip="Open this notebook in JupyterLab"
      />
    );
  }

  if (status === SessionStatusStateEnum.starting) {
    return (
      <SessionFileButtonLoading tooltip="The session is starting, please wait..." />
    );
  }

  if (status === SessionStatusStateEnum.stopping) {
    return (
      <SessionFileButtonLoading tooltip="The session is stopping, please wait..." />
    );
  }

  const target = {
    pathname: sessionStartUrl,
  };

  return (
    <SessionFileButtonComponent
      target={target}
      tooltip="Check session status"
    />
  );
}

interface SessionFileButtonComponentProps {
  hasOrangeAccent?: boolean;
  target: LocationDescriptor;
  tooltip: ReactNode;
}

function SessionFileButtonComponent({
  hasOrangeAccent,
  target,
  tooltip,
}: SessionFileButtonComponentProps) {
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <>
      <span data-cy="check-notebook-icon" ref={ref}>
        <Link to={target}>
          <JupyterIcon
            hasOrangeAccent={hasOrangeAccent}
            className={cx("svg-inline--fa", "fa-w-16", "icon-link")}
          />
        </Link>
      </span>
      <UncontrolledTooltip target={ref}>{tooltip}</UncontrolledTooltip>
    </>
  );
}

interface SessionFileButtonLoadingProps {
  tooltip: ReactNode;
}

function SessionFileButtonLoading({ tooltip }: SessionFileButtonLoadingProps) {
  const ref = useRef<HTMLSpanElement>(null);

  return (
    <>
      <span data-cy="check-notebook-icon" ref={ref}>
        <Loader size={19} inline />
      </span>
      <UncontrolledTooltip target={ref}>{tooltip}</UncontrolledTooltip>
    </>
  );
}
