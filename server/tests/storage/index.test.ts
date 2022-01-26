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

import { REDIS_PREFIX, Storage } from "../../src/storage/index";


// mock ioredis for storing data
jest.mock("ioredis", () => require("ioredis-mock/jest"));

describe("Test storage", () => {
  it("Test Storage class", async () => {
    const storage = new Storage("localhost", 12345, "safePassword");

    // save data
    const path = "somewhere";
    const data = "something";
    await storage.save(path, data, REDIS_PREFIX.AUTH);

    // get data
    let savedData = await storage.get(path, REDIS_PREFIX.AUTH);
    expect(savedData).toBe(data);

    // delete data
    await storage.delete(path, REDIS_PREFIX.AUTH);
    savedData = await storage.get(path, REDIS_PREFIX.AUTH);
    expect(savedData).not.toBe(data);

    // save access to the project
    const userId = "userId";
    const projects = [
      "namespace/my-project",
      "namespace/my-projectA",
      "namespace/my-projectB",
      "namespace/my-project",
    ];

    for (const project of projects)
      await storage.lpush(userId, project, REDIS_PREFIX.DATA);

    // get the last accessed projects
    const projectList = await storage.lrange(userId, 0, -1, REDIS_PREFIX.DATA);
    expect(projectList).toEqual(projects.reverse());
  });

  it("Test Storage disconnect", async () => {
    const storage = new Storage();
    storage.shutdown();
  });
});
