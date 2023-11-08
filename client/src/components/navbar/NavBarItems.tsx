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

import { faGitlab } from "@fortawesome/free-brands-svg-icons";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Person, QuestionCircle } from "react-bootstrap-icons";
import { RootStateOrAny, useSelector } from "react-redux";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";
import { LoginHelper } from "../../authentication";
import AdminDropdownItem from "../../landing/AdminDropdownItem";
import { User } from "../../model/RenkuModels";
import { NotificationsMenu } from "../../notifications";
import { Docs, Links, RenkuPythonDocs } from "../../utils/constants/Docs";
import {
  getActiveProjectPathWithNamespace,
  gitLabUrlFromProfileUrl,
} from "../../utils/helpers/HelperFunctions";
import { Url } from "../../utils/helpers/url";
import { ExternalDocsLink, ExternalLink } from "../ExternalLinks";
import { Loader } from "../Loader";
import { RenkuNavLink } from "../RenkuNavLink";

export function RenkuToolbarItemPlus() {
  const location = useLocation();

  // Display the "new dataset" options only if a project is active.
  const activeProjectPathWithNamespace = getActiveProjectPathWithNamespace(
    location.pathname
  );
  const datasetDropdown = activeProjectPathWithNamespace ? (
    <DropdownItem className="p-0">
      <Link
        className="dropdown-item"
        id="navbar-dataset-new"
        to={`/projects/${activeProjectPathWithNamespace}/datasets/new`}
      >
        Dataset
      </Link>
    </DropdownItem>
  ) : null;
  const projectDropdown = (
    <DropdownItem className="p-0">
      <Link
        className="dropdown-item"
        id="navbar-project-new"
        to="/projects/new"
      >
        Project
      </Link>
    </DropdownItem>
  );

  return (
    <UncontrolledDropdown className="nav-item dropdown">
      <DropdownToggle className="nav-link" nav caret id="plus-dropdown">
        <FontAwesomeIcon icon={faPlus} id="createPlus" />
      </DropdownToggle>
      <DropdownMenu
        aria-labelledby="plus-menu"
        className="plus-menu btn-with-menu-options"
        end
      >
        {projectDropdown}
        {datasetDropdown}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
}

export function RenkuToolbarGitLabMenu() {
  const user = useSelector<RootStateOrAny, User>(
    (state) => state.stateModel.user
  );

  if (!user.fetched) {
    return null;
  }

  const userData = user.data as
    | {
        id: string;
        web_url: string;
      }
    | { id: null };
  if (!userData.id) {
    return null;
  }

  const gitLabUrl = gitLabUrlFromProfileUrl(userData.web_url);

  return (
    <UncontrolledDropdown className="nav-item dropdown">
      <DropdownToggle className="nav-link" nav caret id="gitLab-menu">
        <FontAwesomeIcon icon={faGitlab} id="gitLabDropdownToggle" />
      </DropdownToggle>
      <DropdownMenu
        className="gitLab-menu btn-with-menu-options"
        end
        key="gitLab-bar"
        aria-labelledby="gitLab-menu"
      >
        <DropdownItem className="p-0">
          <ExternalLink
            url={gitLabUrl}
            title="GitLab"
            className="dropdown-item"
            role="link"
          />
        </DropdownItem>
        <DropdownItem className="p-0">
          <ExternalLink
            url={gitLabSettingsUrlFromProfileUrl(userData.web_url)}
            title="Settings"
            className="dropdown-item"
            role="link"
          />
        </DropdownItem>
        <DropdownItem className="p-0">
          <ExternalLink
            url={userData.web_url}
            title="Profile"
            className="dropdown-item"
            role="link"
          />
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
}

function gitLabSettingsUrlFromProfileUrl(webUrl: string): string {
  // Yes, the settings URL ends with 'profile'; the profile URL ends with the username
  const comps = webUrl.split("/");
  comps.pop();
  comps.push("-/profile");
  return comps.join("/");
}

export function RenkuToolbarHelpMenu() {
  return (
    <UncontrolledDropdown className="nav-item dropdown">
      <DropdownToggle className="nav-link" nav caret>
        <QuestionCircle className="bi" id="helpDropdownToggle" />
      </DropdownToggle>
      <DropdownMenu
        className="help-menu btn-with-menu-options"
        key="help-bar"
        aria-labelledby="help-menu"
      >
        <DropdownItem className="p-0">
          <Link className="dropdown-item" to="/help">
            Help
          </Link>
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem className="p-0">
          <ExternalDocsLink
            url={Docs.READ_THE_DOCS_ROOT}
            title="Renku Docs"
            className="dropdown-item"
          />
        </DropdownItem>
        <DropdownItem className="p-0">
          <ExternalDocsLink
            url={RenkuPythonDocs.READ_THE_DOCS_ROOT}
            title="Renku CLI Docs"
            className="dropdown-item"
          />
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem className="p-0">
          <ExternalDocsLink
            url={Links.DISCOURSE}
            title="Forum"
            className="dropdown-item"
          />
        </DropdownItem>
        <DropdownItem className="p-0">
          <ExternalDocsLink
            url={Links.GITTER}
            title="Gitter"
            className="dropdown-item"
          />
        </DropdownItem>
        <DropdownItem className="p-0">
          <ExternalDocsLink
            url={Links.GITHUB}
            title="GitHub"
            className="dropdown-item"
          />
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
}

// TODO: Refactor the App infra to make it possible to get these from the AppContext
interface RenkuToolbarNotificationsProps {
  model: unknown;
  notifications: unknown;
}

export function RenkuToolbarNotifications({
  model,
  notifications,
}: RenkuToolbarNotificationsProps) {
  if (model == null || notifications == null) {
    return null;
  }

  return (
    <UncontrolledDropdown className="nav-item dropdown">
      <NotificationsMenu model={model} notifications={notifications} />
    </UncontrolledDropdown>
  );
}

interface RenkuToolbarItemUserProps {
  params: {
    BASE_URL: string;
    GATEWAY_URL: string;
    UISERVER_URL: string;
  };
}

export function RenkuToolbarItemUser({ params }: RenkuToolbarItemUserProps) {
  const location = useLocation();

  const user = useSelector<RootStateOrAny, User>(
    (state) => state.stateModel.user
  );

  const gatewayURL = params.GATEWAY_URL;
  const uiserverURL = params.UISERVER_URL;
  const redirect_url = encodeURIComponent(params.BASE_URL);

  if (!user.fetched) {
    return <Loader inline size={16} />;
  } else if (!user.logged) {
    const to = Url.get(Url.pages.login.link, { pathname: location.pathname });
    return <RenkuNavLink to={to} title="Login" />;
  }

  return (
    <UncontrolledDropdown className="nav-item dropdown">
      <DropdownToggle className="nav-link" nav caret id="profile-dropdown">
        <Person className="bi" id="userIcon" />
      </DropdownToggle>
      <DropdownMenu
        className="user-menu btn-with-menu-options"
        end
        key="user-bar"
        aria-labelledby="user-menu"
      >
        <DropdownItem className="p-0">
          <ExternalLink
            url={`${gatewayURL}/auth/user-profile`}
            title="Account"
            className="dropdown-item"
            role="link"
          />
        </DropdownItem>
        <AdminDropdownItem />
        <DropdownItem divider />
        <a
          id="logout-link"
          className="dropdown-item"
          onClick={() => {
            LoginHelper.notifyLogout();
          }}
          href={`${uiserverURL}/auth/logout?redirect_url=${redirect_url}`}
        >
          Logout
        </a>
      </DropdownMenu>
    </UncontrolledDropdown>
  );
}
