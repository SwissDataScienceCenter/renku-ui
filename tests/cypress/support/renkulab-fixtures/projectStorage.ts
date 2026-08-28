/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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
import { SimpleFixture } from "./fixtures.types";

/**
 * Fixtures for Project Storage
 */

interface ProjectStorageListArgs extends SimpleFixture {
  projectId?: string;
  hasProjectStorage?: boolean;
}

interface ProjectStoragePatchArgs extends SimpleFixture {
  storageId?: string;
}

interface ProjectStorageDeleteArgs extends SimpleFixture {
  storageId?: string;
}

interface ProjectStorageAllowArgs extends SimpleFixture {
  projectId?: string;
  allowed?: boolean;
}

export function ProjectStorage<T extends FixturesConstructor>(Parent: T) {
  return class ProjectStorageFixtures extends Parent {
    getProjectStorageAllow(args?: ProjectStorageAllowArgs) {
      const {
        fixture = "projectStorage/project-storage-allow.json",
        name = "getProjectStorageAllow",
        projectId = "THEPROJECTULID26CHARACTERS",
        allowed = false,
      } = args ?? {};
      const response = allowed ? { fixture } : { statusCode: 404 };
      cy.intercept("GET", `/api/data/storage/allow/${projectId}`, response).as(
        name,
      );
      return this;
    }

    listProjectStorage(args?: ProjectStorageListArgs) {
      const {
        fixture = "projectStorage/project-storage-list.json",
        name = "listProjectStorage",
        projectId = "THEPROJECTULID26CHARACTERS",
        hasProjectStorage = false,
      } = args ?? {};
      const response = hasProjectStorage ? { fixture } : { body: [] };
      cy.intercept(
        "GET",
        `/api/data/projects/${projectId}/storage`,
        response,
      ).as(name);
      return this;
    }

    postProjectStorage(args?: SimpleFixture) {
      const {
        fixture = "projectStorage/new-project-storage.json",
        name = "postProjectStorage",
      } = args ?? {};
      cy.fixture(fixture).then((projectStorage) => {
        // eslint-disable-next-line max-nested-callbacks
        cy.intercept("POST", `/api/data/storage`, (req) => {
          const newProjectStorage = req.body;
          expect(newProjectStorage.size).to.not.be.undefined;
          expect(newProjectStorage.mount_path).to.not.be.undefined;
          projectStorage.size = newProjectStorage.size;
          projectStorage.mount_path = newProjectStorage.mount_path;
          req.reply({ body: projectStorage, statusCode: 201 });
        }).as(name);
      });
      return this;
    }

    patchProjectStorage(args?: ProjectStoragePatchArgs) {
      const {
        fixture = "projectStorage/new-project-storage.json",
        name = "patchProjectStorage",
        storageId = "PROJECTSTORAGEULID26CHARACTERS",
      } = args ?? {};
      cy.fixture(fixture).then((projectStorage) => {
        // eslint-disable-next-line max-nested-callbacks
        cy.intercept("PATCH", `/api/data/storage/${storageId}`, (req) => {
          const newProjectStorage = req.body;
          expect(newProjectStorage.size).to.not.be.undefined;
          expect(newProjectStorage.mount_path).to.not.be.undefined;
          projectStorage.size = newProjectStorage.size;
          projectStorage.mount_path = newProjectStorage.mount_path;
          req.reply({ body: projectStorage, statusCode: 200 });
        }).as(name);
      });
      return this;
    }

    deleteProjectStorage(args?: ProjectStorageDeleteArgs) {
      const {
        name = "deleteProjectStorage",
        storageId = "PROJECTSTORAGEULID26CHARACTERS",
      } = args ?? {};
      cy.intercept("DELETE", `/api/data/storage/${storageId}`, {
        statusCode: 204,
      }).as(name);
      return this;
    }
  };
}
