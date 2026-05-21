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
import { ConnectedServices } from "./connectedServices";
import { DataConnector } from "./dataConnectors";
import { DataServices } from "./dataServices";
import BaseFixtures from "./fixtures";
import { Global } from "./global";
import { NamespaceV2 } from "./namespaceV2";
import { NewSession } from "./newSession";
import { Projects } from "./projects";
import { ProjectV2 } from "./projectV2";
import { SearchV2 } from "./searchV2";
import { Secrets } from "./secrets";
import { Sessions } from "./sessions";
import { Terms } from "./terms";
import { User } from "./user";

const Fixtures = SearchV2(
  ProjectV2(
    NamespaceV2(
      NewSession(
        Sessions(
          Admin(
            DataConnector(
              DataServices(
                CloudStorage(
                  Projects(
                    Secrets(
                      Terms(User(ConnectedServices(Global(BaseFixtures)))),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  ),
);

const fixtures = new Fixtures();
export default fixtures;

export type FixturesType = InstanceType<typeof Fixtures>;
