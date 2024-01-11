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
import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  CardText,
  Col,
  PopoverBody,
  PopoverHeader,
  Row,
  UncontrolledPopover,
  UncontrolledTooltip,
} from "../../utils/ts-wrappers";

import { Repository } from "../../model/RenkuModels";
import { simpleHash } from "../../utils/helpers/HelperFunctions";
import { ExternalLink } from "../ExternalLinks";
import {
  ErrorLabel,
  HelperLabel,
  InputLabel,
  LoadingLabel,
} from "../formlabels/FormLabels";
import "./TemplateSelector.css";
import { Templates } from "../../features/templates/templates.api";

const defaultTemplateIcon = "/stockimages/templatePlaceholder.svg";

export interface TemplateSelectorProps {
  repositories: Repository[];

  /** To be executed when a template is selected  */
  select: Function; // eslint-disable-line @typescript-eslint/ban-types

  selected?: Templates;

  templates?: Templates[];

  /** when the data(templates) is loading */
  isFetching: boolean;

  /** when is user repo and there is nothing fetched */
  noFetchedUserRepo: boolean;

  /** To indicate the input is required */
  isRequired: boolean;

  /** To show error feedback and mark input as invalid if there is no selection */
  isInvalid?: boolean;

  isDisabled?: boolean;
}

interface TemplateGalleryRowProps {
  repository: Repository;
  select: Function; // eslint-disable-line @typescript-eslint/ban-types
  selected?: Templates;
  templates: Templates[];
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
      const repoTemplates = templates
        ? templates?.filter((t) => t.parentRepo === repoTitle)
        : [];
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
    errorFeedback = <ErrorLabel text={"Please select a valid template"} />;
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
  isInvalid,
  isDisabled,
}: TemplateGalleryRowProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Templates | null>(
    null
  );
  useEffect(() => setSelectedTemplate(selected || null), [selected]);
  const handleSelectedTemplate = (t: Templates) => {
    setSelectedTemplate(t);

    if (select && !isDisabled) select(t);
  };

  // Don't render anything if there are no templates for the repository
  if (!templates || !templates.length) return null;

  // Show a card for each template
  const elements = templates.map((t) => {
    const imgSrc = t.icon
      ? `data:image/png;base64,${t.icon}`
      : defaultTemplateIcon;
    const id = "id" + simpleHash(repository.name) + simpleHash(t.id);
    const selectedClass = selectedTemplate?.id === t.id ? "selected" : "";
    const invalidTemplate = isInvalid ? "template--invalid" : "";
    const statusTemplate = isDisabled
      ? "template--disabled cursor-not-allowed"
      : "template--active cursor-pointer";

    return (
      <Col key={t.id}>
        <Card
          id={id}
          className={`template-card mb-2 text-center box-shadow-cards ${selectedClass} ${invalidTemplate} ${statusTemplate}`}
          onClick={() => {
            handleSelectedTemplate(t);
          }}
          data-cy="project-template-card"
        >
          <CardBody className="p-1">
            <img src={imgSrc} alt={t.id + " template image"} />
          </CardBody>
          <CardFooter className="p-1 bg-white">
            <CardText className="small">{t.name}</CardText>
          </CardFooter>
        </Card>
        <UncontrolledTooltip key="tooltip" placement="bottom" target={id}>
          {t.description}
        </UncontrolledTooltip>
      </Col>
    );
  });

  // Add a title with information about the source repository
  const repositoryInfoId = `info-${repository.name}`;
  const title = (
    <Row>
      <p className="fst-italic mt-2 mb-1">
        Source: {repository.name}
        <FontAwesomeIcon
          id={repositoryInfoId}
          className="ms-2 cursor-pointer"
          icon={faInfoCircle}
        />
      </p>
      <UncontrolledPopover
        target={repositoryInfoId}
        trigger="legacy"
        placement="bottom"
      >
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
  );

  return (
    <div>
      {title}
      <Row className="row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5">
        {elements}
      </Row>
    </div>
  );
}

export default TemplateSelector;
