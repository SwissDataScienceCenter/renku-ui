/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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

import cx from "classnames";
import { useState } from "react";
import type { FieldValues } from "react-hook-form";
import { FormText } from "reactstrap";
import { SlugPreviewFormFieldProps } from "./formField.types.ts";
import SlugFormField from "./SlugFormField";
import ChevronFlippedIcon from "../../../components/icons/ChevronFlippedIcon.tsx";

export default function SlugPreviewFormField<T extends FieldValues>({
  compact = false,
  control,
  errors,
  name,
  resetFunction,
  url,
  slug,
  dirtyFields,
  entityName,
}: SlugPreviewFormFieldProps<T>) {
  const [isCollapseOpen, setIsCollapseOpen] = useState(false);
  const toggleCollapse = () => setIsCollapseOpen(!isCollapseOpen);

  const slugPreview = (
    <div>
      <FormText>
        The URL for this {entityName} will be{" "}
        <span className="fw-bold">
          {url}
          {slug || "<name>"}
        </span>
      </FormText>
      <button
        className={cx("btn", "btn-link", "p-0", "text-decoration-none", "ms-2")}
        data-cy="project-slug-toggle"
        onClick={toggleCollapse}
        type="button"
      >
        <small>Customize URL</small>
        <ChevronFlippedIcon flipped={isCollapseOpen} className="bi" />
      </button>
    </div>
  );

  return (
    <div>
      {slugPreview}

      {isCollapseOpen && (
        <>
          <div
            className={cx("align-items-center", "d-flex", "flex-wrap", "mb-0")}
          >
            <SlugFormField
              compact={compact}
              control={control}
              entityName={entityName}
              errors={errors}
              name={name}
              resetFunction={resetFunction}
              url={url}
            />
            {dirtyFields.slug && !dirtyFields.name ? (
              <div className={cx("d-block", "invalid-feedback")}>
                <p className="mb-0">
                  Mind the URL will be updated once you provide a name.
                </p>
              </div>
            ) : (
              errors.slug &&
              dirtyFields.slug && (
                <div className={cx("d-block", "invalid-feedback")}>
                  <p className="mb-1">
                    {errors?.slug?.message?.toString() ?? ""}
                  </p>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
