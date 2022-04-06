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
 *  renku-ui
 *
 *  newProject.d.tsx
 *  New Project definitions
 */

import { Visibilities } from "../../../utils/components/visibility/Visibility";

interface NewProjectMeta {
  validation: {
    errors: {
      description?: string;
      title?: string;
      visibility?: string;
    },
    warnings: {
      description?: string;
      title?: string;
      visibility?: string;
    }
  },
  userTemplates: any;
  namespace: {
    fetching: boolean;
    visibilities: Visibilities;
    visibility: Visibilities;
  }
}

interface NewProjectInputs {
  descriptionPristine?: boolean;
  description?: string;
  namespace?: string;
  title?: string;
  titlePristine?: boolean;
  userRepo?: string;
  visibility?: Visibilities;
  visibilityPristine?: boolean;
}

interface NewProjectHandlers {
  setProperty: Function;
}

export type { NewProjectMeta, NewProjectInputs, NewProjectHandlers };
