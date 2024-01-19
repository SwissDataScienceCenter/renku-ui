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

import { Location } from "history";
import { Link } from "react-router-dom";

import NotFound from "../../not-found/NotFound";
import { Url } from "../../utils/helpers/url";

interface ProjectViewNotFoundProps {
  userLogged: boolean;
  projectPathWithNamespace?: string | null | undefined;
  projectId?: string | null | undefined;
  location: Location;
}

export const ProjectViewNotFound = ({
  userLogged,
  projectPathWithNamespace,
  projectId,
  location,
}: ProjectViewNotFoundProps) => {
  const tip = userLogged ? (
    <>
      <p>
        If you are sure the project exists, you may want to try the following:
      </p>
      <ul className="mb-0">
        <li>
          Do you have multiple accounts? Are you logged in with the right user?
        </li>
        <li>
          If you received this link from someone, ask that person to make sure
          you have access to the project.
        </li>
      </ul>
    </>
  ) : (
    (() => {
      const to = Url.get(Url.pages.login.link, {
        pathname: location.pathname,
      });
      return (
        <>
          <p>
            You might need to be logged in to see this project. Please try to{" "}
            <Link className="btn btn-secondary btn-sm" to={to}>
              Log in
            </Link>
          </p>
        </>
      );
    })()
  );

  const notFoundText = projectPathWithNamespace ? (
    <>
      path <i>{projectPathWithNamespace}</i>
    </>
  ) : (
    <>
      numeric id <i>{projectId}</i>
    </>
  );
  const notFoundDescription = (
    <>
      <p>We could not find project with {notFoundText}.</p>
      <p>
        It is possible that the project has been deleted by its owner or you do
        not have permission to access it.
      </p>
    </>
  );

  return (
    <NotFound title="Project not found" description={notFoundDescription}>
      {tip}
    </NotFound>
  );
};
