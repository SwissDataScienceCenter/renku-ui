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

class ProjectsCoordinator {
  constructor(client, model) {
    this.client = client;
    this.model = model;
  }

  _starredProjectMetadata(project) {
    let accessLevel = 0;
    if (project.permissions && project.permissions.project_access)
      accessLevel = Math.max(accessLevel, project.permissions.project_access.access_level);

    if (project.permissions && project.permissions.group_access)
      accessLevel = Math.max(accessLevel, project.permissions.group_access.access_level);

    return {
      id: project.id,
      path_with_namespace: project.path_with_namespace,
      description: project.description,
      tag_list: project.tag_list,
      star_count: project.star_count,
      owner: project.owner,
      last_activity_at: project.last_activity_at,
      access_level: accessLevel,
      http_url_to_repo: project.http_url_to_repo
    };
  }

  async getFeatured() {
    if (this.model.get("featured.fetching"))
      return;
    // set status to fetching, get all the projects and filter and invoke both APIs
    this.model.set("featured.fetching", true);
    const params = { order_by: "last_activity_at", per_page: 100 };
    const promiseStarred = this.client.getAllProjects({ ...params, starred: true })
      .then(resp => resp.map((project) => this._starredProjectMetadata(project)))
      .catch(error => []);
    const promiseMember = this.client.getAllProjects({ ...params, membership: true })
      .then(resp => resp.map((project) => this._starredProjectMetadata(project)))
      .catch(error => []);

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
}

export { ProjectsCoordinator };
