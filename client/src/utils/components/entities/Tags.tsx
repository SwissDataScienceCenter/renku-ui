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

import React, { useRef } from "react";
import { ThrottledTooltip } from "../Tooltip";
import { RootStateOrAny, useSelector } from "react-redux";

/**
 *  renku-ui
 *
 *  Entity Tags.tsx
 *  Entity Tags component
 */

export interface EntityTagsProps {
  tagList: string[];
  multiline: boolean
}

function EntityTags ({ tagList, multiline }: EntityTagsProps) {
  const ref = useRef(null);
  const multilineStyles = multiline ? "d-flex flex-wrap gap-1" : "text-truncate";
  const isUpdatingValue = useSelector((state: RootStateOrAny ) =>
    state.stateModel.project?.metadata?.tagList?.updating);

  if (isUpdatingValue) {
    return (
      <div ref={ref} className={`tagList card-tags text-rk-text-light ${multilineStyles}`} data-cy="updating-tag-list">
        <small><i>Updating list...</i></small>
      </div>
    );
  }

  const tooltip = tagList?.length > 0 ?
    <ThrottledTooltip target={ref} tooltip={tagList?.map(tag => `#${tag}`).join(", ")} /> : null;
  return (
    <>
      <div ref={ref} className={`tagList card-tags text-rk-text-light ${multilineStyles}`} data-cy="entity-tag-list">
        {tagList?.map(tag => <span key={tag} className="entity-tag">#{tag}</span>)}
      </div>
      {!multiline ? tooltip : null}
    </>
  );
}

export default EntityTags;

