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
    return {
      id: project.id,
      path_with_namespace: project.path_with_namespace,
      description: project.description,
      tag_list: project.tag_list,
      star_count: project.star_count,
      owner: project.owner,
      last_activity_at: project.last_activity_at
    };
  }

  async getFeatured() {
    if (this.model.get("featured.fetching")) return;
    // set status to fetching and invoke both APIs
    this.model.set("featured.fetching", true);
    const promiseStarred = this.client.getProjects({ starred: true, order_by: "last_activity_at" })
      .then((projectResponse) => {
        const projects = projectResponse.data.map((project) => this._starredProjectMetadata(project));
        return projects;
      })
      .catch((error) => {
        this.model.set("starredProjects", []);
      });
    const promiseMember = this.client.getProjects({ membership: true, order_by: "last_activity_at" })
      .then((projectResponse) => {
        const projects = projectResponse.data.map((project) => this._starredProjectMetadata(project));
        return projects;
      })
      .catch((error) => {
        this.model.set("memberProjects", []);
      });

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
