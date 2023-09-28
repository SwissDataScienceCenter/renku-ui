/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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

import { Link } from "react-router-dom";
import { JupyterIcon } from "../components/Icon";
import { Loader } from "../components/Loader";
import { ThrottledTooltip } from "../components/Tooltip";
import { SessionStatusStateEnum } from "../features/session/sessions.types";
import { Url } from "../utils/helpers/url";
import { NotebooksHelper } from "./index";

// * CheckNotebookIcon code * //
export const CheckNotebookIcon = ({
  fetched,
  notebook,
  location,
  filePath,
  launchNotebookUrl,
}) => {
  const loader = (
    <span className="ms-2 pb-1">
      <Loader size={19} inline />
    </span>
  );
  if (!fetched) return loader;

  let tooltip,
    link,
    icon,
    aligner = null;
  if (notebook) {
    const status = notebook.status?.state;
    if (
      status === SessionStatusStateEnum.running ||
      status === SessionStatusStateEnum.hibernated
    ) {
      const annotations = NotebooksHelper.cleanAnnotations(
        notebook.annotations
      );
      const sessionUrl = Url.get(Url.pages.project.session.show, {
        namespace: annotations["namespace"],
        path: annotations["projectName"],
        server: notebook.name,
      });
      const state = { from: location.pathname, filePath };
      tooltip = "Connect to JupyterLab";
      icon = <JupyterIcon svgClass="svg-inline--fa fa-w-16 icon-link" />;
      link = <Link to={{ pathname: sessionUrl, state }}>{icon}</Link>;
    } else if (
      status === SessionStatusStateEnum.starting ||
      status === SessionStatusStateEnum.stopping
    ) {
      tooltip =
        status === SessionStatusStateEnum.stopping
          ? "The session is stopping, please wait..."
          : "The session is starting, please wait...";
      aligner = "pb-1";
      link = loader;
    } else {
      tooltip = "Check session status";
      icon = (
        <JupyterIcon
          svgClass="svg-inline--fa fa-w-16 icon-link"
          grayscale={true}
        />
      );
      link = <Link to={launchNotebookUrl}>{icon}</Link>;
    }
  } else {
    const successUrl = location ? location.pathname : null;
    const target = {
      pathname: launchNotebookUrl,
      search: "?autostart=1&notebook=" + encodeURIComponent(filePath),
      state: { successUrl },
    };
    tooltip = "Start a session";
    icon = (
      <JupyterIcon
        svgClass="svg-inline--fa fa-w-16 icon-link"
        grayscale={true}
      />
    );
    link = <Link to={target}>{icon}</Link>;
  }

  return (
    <>
      <span
        id="checkNotebookIcon"
        className={aligner}
        data-cy="check-notebook-icon"
      >
        {link}
      </span>
      <ThrottledTooltip target="checkNotebookIcon" tooltip={tooltip} />
    </>
  );
};
