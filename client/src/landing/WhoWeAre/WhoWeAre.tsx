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
import { Envelope, Github, HeartFill } from "react-bootstrap-icons";
import styles from "./WhoWeAre.module.scss";

import { ExternalDocsLink, ExternalLink } from "../../components/ExternalLinks";
import { Links, RenkuContactEmail } from "../../utils/constants/Docs";
import logo_EPFL from "../Logos/EPFL.svg";
import logo_ETH from "../Logos/ETH.svg";
import logo_SDSC from "../Logos/SDSC.svg";
export default function WhoWeAre() {
  const contactEmail = RenkuContactEmail || "";
  return (
    <div id="rk-anon-home-who-we-are">
      <div className="rk-anon-home-section-content">
        <div id={styles.whoWeAreContainer}>
          <div className={styles.whoWeAreTitle}>
            <h2 className="text-rk-green">
              Built by data scientists, for data scientists.
            </h2>
          </div>
          <div className={styles.whoWeAreContent}>
            <div className={styles.whoWeAreText}>
              <p>
                Renku is built by the{" "}
                <ExternalLink role="link" url={Links.SDSC} className="fw-bold">
                  Swiss Data Science Center
                </ExternalLink>{" "}
                with funding from the{" "}
                <ExternalLink role="link" url={Links.ETH} className="fw-bold">
                  ETH domain
                </ExternalLink>
                .
              </p>
              <p>
                Our goal is to provide data and domain scientists with the tools
                they need to work, collaborate and share their research.
              </p>
              <p>
                Developed with <HeartFill className="text-rk-green" /> at ETH
                Zurich and EPFL with contributions from our fantastic community.
              </p>
              <div className={styles.whoWeAreLinks}>
                <div>
                  <ExternalLink
                    className={cx(
                      styles.btnContactUs,
                      "align-self-start",
                      "align-self-lg-center",
                      "gap-2"
                    )}
                    color="rk-green"
                    role="button"
                    id="Contact_us_btn"
                    url={`mailto:${contactEmail}`}
                    title=""
                  >
                    <Envelope size={20} /> Email us!
                  </ExternalLink>
                </div>
                <div>
                  <ExternalDocsLink
                    url={Links.GITHUB}
                    title=""
                    className="text-black d-flex align-items-center gap-2"
                  >
                    {" "}
                    <Github size={20} />
                    Go to the Github repository
                  </ExternalDocsLink>
                </div>
              </div>
            </div>
            <div className={styles.whoWeAreLogos}>
              <ExternalLink url={Links.SDSC} className="" role="link">
                <img src={logo_SDSC} alt="SDSC" height="54" />
              </ExternalLink>
              <div>
                <ExternalLink url={Links.ETHZ} className="" role="link">
                  <img className="mb-2" src={logo_ETH} alt="ETH" height="25" />
                </ExternalLink>
                <div>
                  Turnerstrasse 1,
                  <br />
                  8092 Zürich <br />
                  +41 44 632 80 74
                </div>
              </div>
              <div>
                <ExternalLink url={Links.EPFL} className="" role="link">
                  <img
                    className="mb-2"
                    src={logo_EPFL}
                    alt="EPFL"
                    height="30"
                  />
                </ExternalLink>
                <div>
                  INN Building, Station 14,
                  <br />
                  1015 Lausanne
                  <br />
                  +41 21 693 43 88
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
