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

import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faQuestionCircle } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { ChevronDown } from "react-bootstrap-icons";
import { Button, UncontrolledTooltip } from "reactstrap";
import { ExternalLink } from "../../../../components/ExternalLinks";
import { Loader } from "../../../../components/Loader";
import { simpleHash } from "../../../../utils/helpers/HelperFunctions";
import styles from "./migrations.module.scss";

interface MoreInfoLinkProps {
  url: string;
}
export function MoreInfoLink({ url }: MoreInfoLinkProps) {
  return (
    <span className="d-inline-block">
      <ExternalLink
        url={url}
        role="text"
        iconSup={true}
        iconAfter={true}
        title="More info"
      />
    </span>
  );
}

interface CompositeTitleProps {
  buttonAction?: (() => void) | null;
  buttonDisabled?: boolean;
  buttonDisabledTooltip?: string;
  buttonIcon?: IconProp;
  buttonId?: string;
  buttonText?: string | null;
  level?: string;
  loading: boolean;
  icon: IconProp;
  sectionId: string;
  showDetails: boolean;
  title: string;
  toggleShowDetails: () => void;
}
export function CompositeTitle({
  buttonAction,
  buttonDisabled,
  buttonDisabledTooltip,
  buttonId,
  buttonIcon,
  buttonText,
  level,
  loading,
  icon,
  sectionId,
  showDetails,
  title,
  toggleShowDetails,
}: CompositeTitleProps) {
  const sectionIdFull = sectionId + "-section";
  const finalIcon = loading ? (
    <Loader inline size={16} />
  ) : (
    <FontAwesomeIcon icon={icon} />
  );
  const color = level ? `text-${level}` : "";
  let button: React.ReactNode = null;
  if (buttonText) {
    const finalButtonIcon = buttonIcon ? (
      <FontAwesomeIcon icon={buttonIcon} />
    ) : null;
    const finalButtonText = (
      <>
        {finalButtonIcon} {buttonText}
      </>
    );
    const buttonActionStyle = {
      disabled: buttonDisabled,
      color: level !== "success" ? level : "secondary",
      size: "sm",
    };
    if (buttonAction && buttonId) {
      button = (
        <Button
          {...buttonActionStyle}
          id={buttonId}
          onClick={() => buttonAction()}
        >
          {finalButtonText}
        </Button>
      );
      if (buttonDisabledTooltip && buttonDisabled) {
        const targetId = simpleHash(buttonId);
        button = (
          <>
            <div id={targetId}>{button}</div>
            <UncontrolledTooltip placement="top" target={targetId}>
              {buttonDisabledTooltip}
            </UncontrolledTooltip>
          </>
        );
      }
    }
    // ? this case _should_ not happen
    else button = <Button {...buttonActionStyle}>{finalButtonText}</Button>;
  }

  const buttonDataCy = sectionIdFull + "-action-button";
  const caretDataCy = `${sectionIdFull}-${showDetails ? "close" : "open"}`;
  const titleDataCy = sectionIdFull + "-title";
  return (
    <>
      <div id={sectionIdFull} className={styles.projectStatusSection}>
        <div className="d-flex align-items-center w-100 mb-0">
          <h6
            className={cx(
              styles.sectionTitle,
              !loading && [styles.sectionTitleExpandable, "cursor-pointer"],
              "d-flex align-items-center m-0 me-3 accordion"
            )}
            onClick={toggleShowDetails}
          >
            <div className={`me-2 ${color}`}>{finalIcon}</div>
            <div data-cy={titleDataCy}>{title}</div>
            {!loading && (
              <ChevronDown
                className={cx(
                  styles.chevron,
                  showDetails && styles.chevronIsOpen,
                  "ms-3"
                )}
                data-cy={caretDataCy}
              />
            )}
          </h6>
          {!loading && (
            <div className="ms-auto" data-cy={buttonDataCy}>
              {button}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

interface DetailsSectionProps {
  buttonAction?: () => void;
  buttonDisabled?: boolean;
  buttonIcon?: IconProp;
  buttonText?: string;
  details?: React.ReactElement;
  level?: string;
  icon: IconProp;
  text: string | React.ReactNode;
  title: string;
  titleId: string;
  titleInfo?: string;
  titleDocsUrl?: string;
}
export function DetailsSection({
  buttonAction,
  buttonDisabled,
  buttonIcon,
  buttonText,
  details,
  level,
  icon,
  text,
  title,
  titleId,
  titleInfo,
  titleDocsUrl,
}: DetailsSectionProps) {
  const finalIcon = <FontAwesomeIcon icon={icon} />;
  const color = level ? `text-${level}` : "";
  let button: React.ReactNode = null;
  if (buttonText) {
    const finalButtonIcon = buttonIcon ? (
      <FontAwesomeIcon icon={buttonIcon} />
    ) : null;
    const finalButtonText = (
      <>
        {finalButtonIcon} {buttonText}
      </>
    );

    // ? could make a common component using the more complex one from CompositeTitle
    if (buttonAction) {
      const buttonActionStyle = {
        disabled: buttonDisabled,
        color: level !== "success" ? level : "secondary",
        size: "sm",
      };
      button = (
        <Button {...buttonActionStyle} onClick={() => buttonAction()}>
          {finalButtonText}
        </Button>
      );
    }
  }

  const detailsContent = details ? (
    <div className="mt-2">
      <small className="fst-italic">{details}</small>
    </div>
  ) : null;

  let titlePopover: React.ReactNode = null;
  let finalTitle: React.ReactNode = <span>{title}</span>;
  if (titleInfo) {
    const externalLinkStyles = {
      className: "text-rk-white",
      role: "text",
      iconSup: true,
      iconAfter: true,
    };
    const titleUrl = titleDocsUrl ? (
      <span>
        <br />
        <ExternalLink
          url={titleDocsUrl}
          {...externalLinkStyles}
          title="More info"
        />
      </span>
    ) : null;
    titlePopover = (
      <UncontrolledTooltip placement="top" target={titleId} autohide={false}>
        {titleInfo} {titleUrl}
      </UncontrolledTooltip>
    );
    finalTitle = (
      <span>
        {title}{" "}
        <sup>
          <FontAwesomeIcon icon={faQuestionCircle} />
        </sup>
      </span>
    );
  }

  const textElement: React.ReactNode =
    typeof text === "string" ? <span>{text}</span> : text;

  return (
    <>
      <div className={styles.projectStatusDetailsSection}>
        <div className="d-flex align-items-center w-100">
          <div>
            <span id={titleId}>{finalTitle}</span>
            {titlePopover}
          </div>
          <div className={`mx-3 ${color}`}>{finalIcon}</div>
          <div>{textElement}</div>
          <div className="ms-auto">{button}</div>
        </div>
        {detailsContent}
      </div>
    </>
  );
}
