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

import React from "react";

/**
 *  renku-ui
 *
 *  Entity Slug.tsx
 *  Entity Slug component
 */

export interface SlugProps {
  multiline: boolean;
  slug: string | React.ReactNode;
}

function Slug({ multiline, slug }: SlugProps) {
  if (!slug) slug = "";
  if (multiline) {
    return <div className="card-text text-rk-text-light">
      {slug}
    </div>;
  }

  return <div className="card-entity-row font-weight-light text-rk-text text-truncate">
    {slug}
  </div>;
}

export default Slug;
