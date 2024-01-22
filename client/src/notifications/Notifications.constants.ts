/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

export enum NOTIFICATION_LEVELS {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
}

export enum NOTIFICATION_TOPICS {
  AUTHENTICATION = "Authentication",
  DATASET_CREATE = "Dataset creation",
  DATASET_FILES_UPLOADED = "Dataset files upload",
  SESSION_START = "Session",
  PROJECT_API = "Project data",
  PROJECT_DELETED = "Project deleted",
  PROJECT_FORKED = "Project forked",
  KG_ACTIVATION = "KG Activation",
  USER_PREFERENCES = "User Preferences",
}

export const NotificationTypes = {
  TOAST: "toast",
  DROPDOWN: "dropdown",
  COMPLETE: "complete",
  CUSTOM: "custom",
};
