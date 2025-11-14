/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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
import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router";

import { InfoAlert } from "~/components/Alert";
import { ExternalLink } from "~/components/ExternalLinks";
import { Links, RenkuContactEmail } from "~/utils/constants/Docs";
import Background from "./Background.svg";

import styles from "./NoLegacySupport.module.css";

function MigrateContentInfo() {
  const [isRenkulabIo, setIsRenkulabIo] = useState(false);
  useEffect(() => {
    const hostname = window.location.hostname;
    if (
      hostname === "renkulab.io" ||
      hostname.endsWith(".renkulab.io") ||
      hostname === "dev.renku.ch" ||
      hostname.endsWith(".dev.renku.ch")
    ) {
      setIsRenkulabIo(true);
    }
  }, []);
  if (!isRenkulabIo)
    return <div className={cx("mt-4", "gap-3", "px-5", styles.alertBox)}></div>;

  return (
    <div className={cx("mt-4", "gap-3", "px-5", styles.alertBox)}>
      <InfoAlert className="mb-0" dismissible={false} timeout={0}>
        <b>
          Do you need to retrieve content from Renku Legacy that was not
          migrated?
        </b>{" "}
        The migration window is closed. We are handling late retrievals on a
        case-by-case basis with limited capacity.{" "}
        <ExternalLink
          className="text-dark"
          role="text"
          title="Submit a data retrieval request."
          url={`mailto:${RenkuContactEmail}`}
        />
      </InfoAlert>
    </div>
  );
}

export default function NoLegacySupport() {
  const description =
    "Renku Legacy is no longer supported, and has been replaced by a new version of Renku, Renku 2.0.";
  const descriptionType = typeof description;
  const Tag =
    descriptionType === "string" ||
    descriptionType === "number" ||
    descriptionType === "boolean"
      ? "p"
      : "div";

  const homeLink = "/";
  const backgroundImage: CSSProperties = {
    backgroundImage: `url("${Background}")`,
  };
  return (
    <div
      className={cx(
        "w-100",
        "d-flex",
        "flex-column",
        "justify-content-center",
        "bg-navy",
        styles.background
      )}
      style={backgroundImage}
    >
      <div className={cx("m-auto")}>
        <div className={cx("d-flex", "pb-5", "px-0", "container-lg")}>
          <div
            className={cx(
              "bg-white",
              "m-auto",
              "d-flex",
              "flex-column",
              "align-items-center",
              "mt-2",
              "mb-5",
              "px-5",
              "py-5"
            )}
          >
            <h2
              data-cy="not-found-title"
              className={cx("fw-bold", "d-flex", "align-items-center", "gap-3")}
            >
              This version of Renku is no longer supported
            </h2>
            <Tag data-cy="not-supported-description" className="mt-4">
              {description}
            </Tag>
            <div
              className={cx("d-flex", "align-items-center", "gap-3", "mt-2")}
            >
              <Link to={homeLink} className={cx("btn", "btn-primary")}>
                Go to Renku 2.0
              </Link>
              <ExternalLink
                className="text-dark"
                role="text"
                title="Learn more"
                url={Links.RENKU_2_WHY_RENKU}
              />
            </div>
            <MigrateContentInfo />
            <div className={cx("mt-4", "text-center")}>
              Join us on the{" "}
              <ExternalLink
                className="text-dark"
                role="text"
                title="Community Portal"
                url={Links.DISCOURSE}
              />{" "}
              to learn, connect, and begin your journey with Renku.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
