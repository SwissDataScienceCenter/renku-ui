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

import cx from "classnames";
import skeletonCardImage from "../../styles/assets/SkeletonCard.svg";
import styles from "./EntityCardSkeleton.module.scss";

export default function EntityCardSkeleton() {
  return (
    <div className={styles.skeletonWrapper}>
      <div className={styles.skeletonImg}>
        <img
          className="skeletonCardImage"
          src={skeletonCardImage}
          alt="skeleton card"
          loading={"lazy"}
        />
        <div
          className={cx([styles.skeletonImgGraphic, styles.skeletonLoader])}
        />
      </div>
    </div>
  );
}
