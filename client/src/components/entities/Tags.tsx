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

import { useRef } from "react";
import { UncontrolledTooltip } from "reactstrap";

import useLegacySelector from "../../utils/customHooks/useLegacySelector.hook";

/**
 *  renku-ui
 *
 *  Entity Tags.tsx
 *  Entity Tags component
 */

export interface EntityTagsProps {
  hideEmptyTags: boolean;
  multiline: boolean;
  tagList: string[];
}

function EntityTags({ hideEmptyTags, multiline, tagList }: EntityTagsProps) {
  const ref = useRef(null);
  const multilineStyles = multiline
    ? "d-flex flex-wrap text-rk-text-light"
    : "text-truncate text-dark";
  const isUpdatingValue = useLegacySelector(
    (state) => state.stateModel?.project?.metadata?.tagList?.updating
  );

  if (isUpdatingValue) {
    return (
      <div
        ref={ref}
        className={`tagList card-tags text-rk-text-light ${multilineStyles}`}
        data-cy="updating-tag-list"
      >
        <small>
          <i>Updating list...</i>
        </small>
      </div>
    );
  }

  if (!tagList?.length && hideEmptyTags) return null;

  const tooltip =
    tagList?.length > 0 ? (
      <UncontrolledTooltip target={ref}>
        {tagList?.map((tag) => `#${tag}`).join(", ")}
      </UncontrolledTooltip>
    ) : null;
  return (
    <>
      <div
        ref={ref}
        data-cy="entity-tag-list"
        className={`tagList card-tags ${multilineStyles}`}
      >
        {tagList?.map((tag) => (
          <span
            key={tag}
            className={`entity-tag ${multiline ? "entity-tag--small" : ""}`}
          >
            #{tag}
          </span>
        ))}
      </div>
      {!multiline ? tooltip : null}
    </>
  );
}

export default EntityTags;
