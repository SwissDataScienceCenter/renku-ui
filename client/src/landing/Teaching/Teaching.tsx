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
import { HeartFill } from "react-bootstrap-icons";
import { ExternalLink } from "../../components/ExternalLinks";
import { Docs } from "../../utils/constants/Docs";
import Teaching_Graph from "../Graphics/Teaching.svg";
import styles from "../Teaching/Teaching.module.scss";

export default function Teaching() {
  return (
    <div id="rk-anon-home-teaching">
      <div className="rk-anon-home-section-content">
        <div id={styles.teachingContainer}>
          <div className={styles.teachingTitle}>
            <h2>Compute courses without the hassle</h2>
          </div>
          <div>
            <img
              src={Teaching_Graph}
              className={styles.teachingGraph}
              alt="Teaching Graph"
              loading={"lazy"}
            />
          </div>
          <div className={styles.teachingContent}>
            <p className="fw-bold">
              Teaching <HeartFill className="text-rk-green" /> Renkulab!
            </p>
            <p>
              <span>Get your students running from day 1.</span>
              <span>All your students need is a browser! </span>
            </p>
            <div className="d-flex justify-content-center">
              <ExternalLink
                className={cx([
                  styles.btnLearnMore,
                  "align-self-start",
                  "align-self-lg-center",
                  "gap-2",
                ])}
                color="rk-green"
                role="button"
                id="Learn_More_Teaching_btn"
                url={Docs.rtdTopicGuide(
                  "miscellaneous/teaching_with_renkulab.html"
                )}
                title="Learn More"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
