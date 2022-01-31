/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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

import { RedisStorage } from "../../src/storage/RedisStorage";
import { TypeData } from "../../src/storage";
import { AUTH_PREFIX, LPROJECTS_PREFIX } from "../../src/utils/const";


// mock ioredis for storing data
jest.mock("ioredis", () => require("ioredis-mock/jest"));

describe("Test storage", () => {
  it("Test Storage class", async () => {
    const storage = new RedisStorage("localhost", 12345, "safePassword");

    // save data
    const path = "somewhere";
    const data = "something";
    await storage.save(`${AUTH_PREFIX}${path}`, data, { type: TypeData.String });

    // get data
    let savedData = await storage.get(`${AUTH_PREFIX}${path}`, { type: TypeData.String });
    expect(savedData).toBe(data);

    // delete data
    await storage.delete(`${AUTH_PREFIX}${path}`);
    savedData = await storage.get(`${AUTH_PREFIX}${path}`, { type: TypeData.String });
    expect(savedData).not.toBe(data);

    // save access to the project
    const userId = "userId";
    const projects = [
      "namespace/my-project",
      "namespace/my-projectA",
      "namespace/my-projectB",
      "namespace/my-projectB",
    ];
    const projectsExpected = [
      "namespace/my-projectB",
      "namespace/my-projectA",
      "namespace/my-project",
    ];

    for (const project of projects) {
      const projectDate = Date.now();
      await storage.save(`${LPROJECTS_PREFIX}${userId}`, project,
        {
          type: TypeData.Collections,
          limit: 10,
          score: projectDate
        });
    }


    // get the last accessed projects
    const projectList = await storage.get(`${LPROJECTS_PREFIX}${userId}`, {
      type: TypeData.Collections,
      start: 0,
      stop: 4
    });
    expect(projectList).toEqual(projectsExpected);
  });

  it("Test Storage disconnect", async () => {
    const storage = new RedisStorage();
    storage.shutdown();
  });
});
