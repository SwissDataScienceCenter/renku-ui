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

/**
 *  renku-ui
 *
 *  TemplateSelector.tsx
 *  TemplateSelector component
 */

import { faInfoCircle } from "@fortawesome/free-solid-svg-icons/faInfoCircle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import cx from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons";
import {
  Card,
  CardBody,
  CardText,
  Col,
  Label,
  PopoverBody,
  PopoverHeader,
  Row,
  UncontrolledPopover,
} from "reactstrap";

import { NewProjectTemplate, Repository } from "../../model/renkuModels.types";
import { simpleHash } from "../../utils/helpers/HelperFunctions";
import { ExternalLink } from "../ExternalLinks";
import {
  ErrorLabel,
  HelperLabel,
  InputLabel,
  LoadingLabel,
} from "../formlabels/FormLabels";

import styles from "./TemplateSelector.module.scss";

const defaultTemplateIcon = "/stockimages/templatePlaceholder.svg";

export interface TemplateSelectorProps {
  repositories: Repository[];

  /** To be executed when a template is selected  */
  select: Function; // eslint-disable-line @typescript-eslint/ban-types

  selected: string;

  templates: NewProjectTemplate[];

  /** when the data(templates) is loading */
  isFetching: boolean;

  /** when is user repo and there is nothing fetched */
  noFetchedUserRepo: boolean;

  /** To indicate the input is required */
  isRequired: boolean;

  /** To show error feedback and mark input as invalid if there is no selection */
  isInvalid?: boolean;

  isDisabled?: boolean;

  error?: string;
}

interface TemplateGalleryRowProps {
  repository: Repository;
  select: Function; // eslint-disable-line @typescript-eslint/ban-types
  selected: string;
  templates: NewProjectTemplate[];
  isInvalid?: boolean;
  isDisabled?: boolean;
}

/**
 * Template Selector functional component
 * @param {TemplateSelectorProps} props - TemplateSelector options
 */
function TemplateSelector({
  repositories,
  select,
  selected,
  templates,
  isRequired,
  isInvalid,
  isDisabled,
  isFetching,
  noFetchedUserRepo,
  error,
}: TemplateSelectorProps) {
  let content;
  let totalTemplates = 0;

  if (isFetching) {
    content = <LoadingLabel text="Fetching templates..." />;
  } else if (noFetchedUserRepo) {
    content = (
      <HelperLabel text="Fetch templates first, or switch template source to RenkuLab" />
    );
  } else {
    content = repositories.map((repository: Repository) => {
      const repoTitle = repository.name;
      const repoTemplates = templates.filter((t) => t.parentRepo === repoTitle);
      totalTemplates += repoTemplates.length;
      const repoKey = simpleHash(repository.url + repository.ref);
      return (
        <TemplateGalleryRow
          key={repoKey}
          repository={repository}
          select={select}
          selected={selected}
          templates={repoTemplates}
          isDisabled={isDisabled}
          isInvalid={isInvalid}
        />
      );
    });
  }

  let errorFeedback;
  if (isInvalid && totalTemplates > 0)
    errorFeedback = (
      <ErrorLabel text={error ?? "Please select a valid template"} />
    );
  else if (isInvalid && totalTemplates === 0 && !noFetchedUserRepo)
    errorFeedback = <ErrorLabel text={"Error no templates available"} />;

  return (
    <>
      <InputLabel text="Template" isRequired={isRequired} />
      <div>{content}</div>
      {errorFeedback}
    </>
  );
}

interface TemplateRepositoryLinkProps {
  url: string;
}
// Show a link when we have a valid url. Otherwise, just simple text
function TemplateRepositoryLink({ url }: TemplateRepositoryLinkProps) {
  let repoUrl = url && url.length && url.startsWith("http") ? url : "";
  if (repoUrl.endsWith(".git")) repoUrl = repoUrl.substring(repoUrl.length - 4);
  return repoUrl ? (
    <ExternalLink url={repoUrl} title={url} role="link" />
  ) : null;
}

function TemplateGalleryRow({
  repository,
  select,
  selected,
  templates,
  isDisabled,
}: TemplateGalleryRowProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  useEffect(() => setSelectedTemplate(selected), [selected]);
  const onSelectTemplate = useCallback(
    (templateId: string) => {
      return function onSelect() {
        setSelectedTemplate(templateId);
        if (select && !isDisabled) {
          select(templateId);
        }
      };
    },
    [isDisabled, select]
  );

  const ref = useRef<HTMLSpanElement>(null);

  if (!templates || !templates.length) return null;

  return (
    <div>
      <Row>
        <p className="fst-italic mt-2 mb-1">
          Source: {repository.name}
          <span ref={ref}>
            <FontAwesomeIcon
              className="ms-2 cursor-pointer"
              icon={faInfoCircle}
            />
          </span>
        </p>
        <UncontrolledPopover trigger="legacy" placement="bottom" target={ref}>
          <PopoverHeader>{repository.name} templates</PopoverHeader>
          <PopoverBody>
            <p className="mb-1">
              <span className="fw-bold">Repository</span>:&nbsp;
              <TemplateRepositoryLink url={repository.url} />
            </p>
            <p className="mb-0">
              <span className="fw-bold">Reference</span>: {repository.ref}
            </p>
          </PopoverBody>
        </UncontrolledPopover>
      </Row>

      <Row
        className={cx("row-cols-2", "row-cols-sm-3", "row-cols-lg-4", "gy-4")}
      >
        {templates.map((template) => (
          <TemplateItem
            key={template.id}
            repositoryName={repository.name}
            template={template}
            isDisabled={isDisabled}
            isSelected={selectedTemplate === template.id}
            onSelectTemplate={onSelectTemplate(template.id)}
          />
        ))}
      </Row>
    </div>
  );
}

interface TemplateItemProps {
  repositoryName: string;
  template: NewProjectTemplate;
  isDisabled?: boolean;
  isSelected?: boolean;
  onSelectTemplate?: () => void;
}

function TemplateItem({
  repositoryName,
  template,
  isDisabled,
  isSelected,
  onSelectTemplate,
}: TemplateItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { description, icon, id, isSshSupported, name } = template;
  const imgSrc = icon ? `data:image/png;base64,${icon}` : defaultTemplateIcon;
  const elementId = `template-${simpleHash(repositoryName)}-${simpleHash(id)}`;

  return (
    <Col>
      <input
        className={cx("btn-check")}
        checked={isSelected}
        disabled={isDisabled}
        onChange={onSelectTemplate}
        type="radio"
        name="template"
        value={template.id}
        autoComplete="off"
        id={elementId}
      />
      <Label
        className={cx(
          "d-block",
          "h-100",
          "w-100",
          "rounded",
          "focus-ring",
          "focus-ring-primary",
          isDisabled ? "cursor-not-allowed" : "cursor-pointer",
          styles.templateLabel
        )}
        for={elementId}
      >
        <Card
          className={cx(
            "h-100",
            "w-100",
            "d-flex",
            "flex-column",
            "shadow",
            isDisabled && "opacity-50",
            styles.templateCard
          )}
          data-cy="project-template-card"
          innerRef={ref}
        >
          <CardBody
            className={cx(
              "text-center",
              "p-4",
              "overflow-hidden",
              "border",
              "rounded-top",
              isSelected ? "border-rk-green" : "border-rk-white",
              styles.templateCardImage
            )}
          >
            <img
              src={imgSrc}
              alt={`${id} template image`}
              className={cx("object-fit-contain")}
              width={"60px"}
              height={"60px"}
            />
          </CardBody>
          <CardBody
            className={cx(
              "border-top",
              "border-2",
              "rounded-bottom",
              "flex-column",
              "justify-content-center",
              isSelected && ["border-rk-green", "bg-rk-green", "text-rk-white"],
              styles.templateCardName
            )}
          >
            <CardText className={cx("small", "text-center", "m-0")}>
              {name}
            </CardText>
          </CardBody>
          <CardBody
            className={cx(
              "overflow-auto",
              "flex-shrink-1",
              "rounded-top",
              "text-white",
              styles.templateCardDescription
            )}
          >
            <CardText className={cx("small")}>{description}</CardText>
          </CardBody>
          <CardBody
            className={cx(
              "py-2",
              "flex-grow-0",
              "border-top",
              "border-1",
              "border-white",
              "rounded-bottom",
              "text-white",
              styles.templateCardSsh
            )}
          >
            <CardText className={cx("small", "m-0")}>
              {isSshSupported ? (
                <>
                  <CheckCircleFill className={cx("bi", "me-1")} />
                  Supports SSH
                </>
              ) : (
                <>
                  <XCircleFill className={cx("bi", "me-1")} />
                  No SSH
                </>
              )}
            </CardText>
          </CardBody>
        </Card>
      </Label>
    </Col>
  );
}

export default TemplateSelector;
