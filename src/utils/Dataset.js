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
 *  utils/Dataset.js
 *  Dataset utils
 */

const ImportStateMessage = {
  ENQUEUED: "Dataset import will start soon...",
  IN_PROGRESS: "Importing dataset...",
  COMPLETED: "Dataset was imported, you will be redirected soon...",
  FAILED: "Dataset import failed: ",
  FAILED_NO_INFO: "Dataset import failed, please try again.",
  TOO_LONG: "Dataset import is taking too long, please check if the dataset was imported, and if it wasn't, try again.",
  KG_TOO_LONG: "The knowledge graph update has not yet finished." +
  " The dataset was imported and should be visible in a short time."
};

export { ImportStateMessage };
