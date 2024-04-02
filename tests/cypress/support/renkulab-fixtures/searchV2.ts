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

import { FixturesConstructor } from "./fixtures";
import { NameOnlyFixture } from "./fixtures.types";
import { generateProjects } from "./projectV2";

interface SearchV2ListProjectsArgs extends NameOnlyFixture {
  numberOfProjects?: number;
  numberOfUsers?: number;
}

function generateSearchProjects(num: number) {
  const projects = generateProjects(num, 1);
  return projects.map((project) => {
    return {
      ...project,
      type: "Project",
      createdBy: project.created_by,
      members: [project.created_by],
    };
  });
}

function generateSearchUsers(num: number) {
  const users = [];
  for (let i = 0; i < num; ++i) {
    const id = 1000 + i;
    const user = {
      id: `id_${id}`,
      type: "User",
    };
    users.push(user);
  }
  return users;
}

export function SearchV2<T extends FixturesConstructor>(Parent: T) {
  return class SearchV2Fixtures extends Parent {
    searchV2ListProjects(args?: SearchV2ListProjectsArgs) {
      const {
        name = "createProjectV2",
        numberOfProjects = args?.numberOfProjects ?? 5,
        numberOfUsers = args?.numberOfUsers ?? 2,
      } = args ?? {};

      const bodyProjects = generateSearchProjects(numberOfProjects);
      const bodyUsers = generateSearchUsers(numberOfUsers);

      function getBody(items) {
        return {
          items,
          pagingInfo: {
            page: {
              limit: 25,
              offset: 0,
            },
            totalResult: items.length,
            totalPages: Math.floor(items.length / 25) + 1,
            prevPage: 0,
            nextPage: Math.floor(items.length / 25) + 1 > 1 ? 1 : 0,
          },
        };
      }

      cy.intercept("GET", "/ui-server/api/search?*", (req) => {
        let body = null;
        const queryString = req.query["q"].toString();
        if (queryString.includes("type:")) {
          if (queryString.includes("type:project,user")) {
            body = getBody([...bodyProjects, ...bodyUsers]);
          } else if (queryString.includes("type:user")) {
            body = getBody(bodyUsers);
          } else {
            body = getBody(bodyProjects);
          }
        } else {
          body = getBody([...bodyProjects, ...bodyUsers]);
        }
        req.reply({
          body,
        });
      }).as(name);
      return this;
    }
  };
}
