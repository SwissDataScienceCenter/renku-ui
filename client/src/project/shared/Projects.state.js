/*!
 * Copyright 2020 - Swiss Data Science Center (SDSC)
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

/**
 *  renku-ui
 *
 *  Projects.state.js
 *  Projects controller code.
 */

import { computeVisibilities } from "../../utils/helpers/HelperFunctions";
import { formatProjectMetadata } from "../../utils/helpers/ProjectFunctions";


class ProjectsCoordinator {
  constructor(client, model) {
    this.client = client;
    this.model = model;
  }

  _starredProjectMetadata(project) {
    return formatProjectMetadata(project);
  }

  async getFeatured() {
    if (this.model.get("featured.fetching"))
      return;
    // set status to fetching, get all the projects and filter and invoke both APIs
    this.model.set("featured.fetching", true);
    const params = { query: "last_activity_at", per_page: 100 };
    const promiseStarred = this.client.getAllProjects({ ...params, starred: true })
      .then(resp => resp.map((project) => this._starredProjectMetadata(project)))
      .catch(() => []);

    const promiseMember = this.client.getAllProjectsGraphQL(params)
      .then(resp => {
        return resp.map((project) => this._starredProjectMetadata(project));
      })
      .catch(() => []);


    // set `featured` content and return only `starred` and `member` projects data
    return Promise.all([promiseStarred, promiseMember]).then(values => {
      this.model.setObject({
        featured: {
          starred: { $set: values[0] },
          member: { $set: values[1] },
          fetched: new Date(),
          fetching: false
        }
      });
      return { starred: values[0], member: values[1] };
    });
  }

  _setLandingProjects(projectList, lastVisited) {
    this.model.setObject({
      landingProjects: {
        fetched: new Date(),
        fetching: false,
        list: { $set: projectList },
        lastVisited,
      }
    });
  }

  async _getOwnProjectsForLanding() {
    let projectList = [];
    const params = { order_by: "last_activity_at", per_page: 5, membership: true };
    const landingProjects = await this.client.getProjects({ ...params });
    projectList = landingProjects?.data?.map((project) => this._starredProjectMetadata(project)) ?? [];
    this._setLandingProjects(projectList, false);
  }

  updateStarred(project, isStarred) {
    const starred = this.model.get("featured.starred");
    let newStarred;
    if (isStarred) {
      newStarred = [...starred, this._starredProjectMetadata(project)];
    }
    else {
      const indexToRemove = starred.map(project => project.id).indexOf(project.id);
      newStarred = [
        ...starred.slice(0, indexToRemove),
        ...starred.slice(indexToRemove + 1)
      ];
    }
    this.model.set("featured.starred", newStarred);
    return newStarred;
  }

  async getVisibilities(namespace, projectVisibility) {
    let availableVisibilities = null;
    let options = projectVisibility ? [projectVisibility] : [];
    if (!namespace)
      return null;

    if (namespace?.kind === "user") {
      options.push("public");
      return computeVisibilities(options);
    }
    else if (namespace?.kind === "group") {
      // get group visibility
      const group = await this.client.getGroupByPath(namespace.full_path).then(r => r.data);
      options.push(group.visibility);
      return computeVisibilities(options);
    }
    return availableVisibilities;
  }
}

export { ProjectsCoordinator };
