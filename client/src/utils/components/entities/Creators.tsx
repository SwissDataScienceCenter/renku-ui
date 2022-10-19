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
import { EntityType } from "./Entities";
import { stylesByItemType } from "../../helpers/HelperFunctions";

/**
 *  renku-ui
 *
 *  Entity Creators.tsx
 *  Entity Creators component
 */

export interface EntityCreator {
  name: string;
  affiliation?: string;
}

export interface EntityCreatorsProps {
  display: "grid" | "list" | "plain" | "tree";
  creators: EntityCreator[];
  itemType: EntityType;
}
function EntityCreators({ display, creators, itemType }: EntityCreatorsProps) {
  let creatorsText;
  const stylesByItem = stylesByItemType(itemType);
  if (!creators) {
    creatorsText = <span className="fst-italic">Unknown creator</span>;
  }
  else {
    creatorsText = creators.slice(0, 3)
      .map((creator) => creator.name + (creator.affiliation ? ` (${creator.affiliation})` : "")).join(", ");
    if (creators.length > 3)
      creatorsText += ", et al.";
  }

  if (display === "plain")
    return (<span>{creatorsText}</span>);

  if (display === "list") {
    return (
      <div className={`card-text creators text-truncate ${stylesByItem.colorText}`}>
        {creatorsText}
      </div>
    );
  }

  if (display === "tree") {
    if (!creatorsText)
      return null;
    return (<p className="text-rk-text small">{creatorsText}</p>);
  }

  return (
    <div className={`creators text-truncate text-rk-text ${ stylesByItem.colorText }`}>
      <small style={{ display: "block" }} className="font-weight-light">
        {creatorsText}
      </small>
    </div>
  );
}

export default EntityCreators;
