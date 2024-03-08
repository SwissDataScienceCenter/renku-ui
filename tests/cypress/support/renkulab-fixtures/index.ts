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

/**
 * Common fixtures defined in one place.
 */
import { Admin } from "./admin";
import { CloudStorage } from "./cloudStorage";
import { Dashboard } from "./dashboard";
import { DataServices } from "./dataServices";
import { Datasets } from "./datasets";
import BaseFixtures from "./fixtures";
import { Global } from "./global";
import { KgSearch } from "./kgSearch";
import { NewProject } from "./newProject";
import { NewSession } from "./newSession";
import { Projects } from "./projects";
import { ProjectV2 } from "./projectV2";
import { SearchV2 } from "./searchV2";
import { Sessions } from "./sessions";
import { Terms } from "./terms";
import { User } from "./user";
import { UserPreferences } from "./user-preferences";
import { Versions } from "./versions";
import { V2Namespace } from "./v2Namespace";
import { Workflows } from "./workflows";

const V1Fixtures = NewProject(
  NewSession(
    Dashboard(
      Sessions(
        Admin(
          DataServices(
            CloudStorage(
              Datasets(
                Projects(
                  ProjectV2(
                    SearchV2(
                      Terms(
                        User(
                          UserPreferences(
                            Versions(Workflows(KgSearch(Global(BaseFixtures))))
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  )
);

const Fixtures = ProjectV2(V2Namespace(V1Fixtures));

const fixtures = new Fixtures();
export default fixtures;

export type FixturesType = InstanceType<typeof Fixtures>;
