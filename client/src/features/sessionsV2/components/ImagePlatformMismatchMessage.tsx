/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import { ErrorAlert } from "~/components/Alert";
import type { ImagePlatformCompatibility } from "../useImagePlatformCompatibility.hook";

interface ImagePlatformMismatchMessageProps {
  className?: string;
  compatibility: ImagePlatformCompatibility;
}

export default function ImagePlatformMismatchMessage({
  className,
  compatibility: { isCompatible, imagePlatforms },
}: ImagePlatformMismatchMessageProps) {
  if (isCompatible !== false || imagePlatforms == null) {
    return null;
  }

  return (
    <ErrorAlert
      className={cx("mb-0", className)}
      data-cy="image-platform-mismatch"
      dismissible={false}
    >
      The launcher image supports <code>{imagePlatforms.join(", ")}</code>, so
      it cannot run on this resource pool. You have to either choose a
      compatible image or change the resource pool.
    </ErrorAlert>
  );
}
