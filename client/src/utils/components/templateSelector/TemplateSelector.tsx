import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

import defaultTemplateIcon from "../../../project/new/templatePlaceholder.svg";
import { simpleHash } from "../../helpers/HelperFunctions";
import { ExternalLink } from "../ExternalLinks";
import "./TemplateSelector.css";

import {
  Card, CardBody, CardText, CardFooter, Col,
  UncontrolledPopover, PopoverHeader, PopoverBody, Row, UncontrolledTooltip, Label
} from "reactstrap/lib";
import { useEffect, useState } from "react";

export interface Repository {
  url: string;
  ref: string;
  name: string;
}

export interface ProjectTemplate {
  id: string;
  description: string;
  icon?: string;
  name: string;
  variables?: Object;
  parentRepo?: string;
  parentTemplate?: string;
}

export interface TemplateSelectorProps {
  repositories: Repository[];

  /** To be executed when a template is selected  */
  select: Function;

  selected: string;

  templates: ProjectTemplate[];

  /** To indicate the input is required */
  isRequired?: boolean;

  /** To show error feedback and mark input as invalid if there is no selection */
  isInvalid?: boolean;

  isDisabled?: boolean;
}

interface TemplateGalleryRowProps {
  repository: Repository;
  select: Function;
  selected: string;
  templates: ProjectTemplate[];
  isInvalid?: boolean;
  isDisabled?: boolean;
}


/**
 * Template Selector functional component
 * @param {TemplateSelectorProps} props - TemplateSelector options
 */
function TemplateSelector(
  { repositories, select, selected, templates, isRequired, isInvalid, isDisabled }: TemplateSelectorProps) {

  const requiredLabel = isRequired ? (<span className="required-label">*</span>) : null;
  const errorFeedback = isInvalid ?
    (<div className="error-feedback">
      <FontAwesomeIcon icon={faExclamationTriangle} />{" "}Please select template</div>)
    : null;
  // One GalleryRow for each source
  const gallery = repositories.map((repository: Repository) => {
    const repoTitle = repository.name;
    const repoTemplates = templates.filter(t => t.parentRepo === repoTitle);
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

  return (
    <div className="py-3">
      <Label>Template {requiredLabel}</Label>
      <div>{gallery}</div>
      {errorFeedback}
    </div>);
}

interface TemplateRepositoryLinkProps {
  url: string;
}
// Show a link when we have a valid url. Otherwise, just simple text
function TemplateRepositoryLink({ url }: TemplateRepositoryLinkProps) {
  let repoUrl = url && url.length && url.startsWith("http") ?
    url :
    "";
  if (repoUrl.endsWith(".git"))
    repoUrl = repoUrl.substring(repoUrl.length - 4);
  return repoUrl ?
    (<ExternalLink url={repoUrl} title={url} role="link" />) :
    null;
}

function TemplateGalleryRow(
  { repository, select, selected, templates, isInvalid, isDisabled }: TemplateGalleryRowProps) {

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  useEffect(() => setSelectedTemplate(selected), [selected]);
  const handleSelectedTemplate = (id: string) => {
    setSelectedTemplate(id);

    if (select && !isDisabled)
      select(id);
  };

  // Don't render anything if there are no templates for the repository
  if (!templates || !templates.length)
    return null;

  // Show a card for each template
  const elements = templates.map(t => {
    const imgSrc = t.icon ?
      `data:image/png;base64,${t.icon}` :
      defaultTemplateIcon;
    const id = "id" + simpleHash(repository.name) + simpleHash(t.id);
    const selectedClass = selectedTemplate === t.id ? "selected" : "";
    const invalidTemplate = isInvalid ? "template--invalid" : "";
    const statusTemplate = isDisabled ? "template--disabled cursor-not-allowed" : "template--active cursor-pointer";

    return (
      <Col key={t.id}>
        <Card id={id}
          className={`template-card mb-2 text-center ${selectedClass} ${invalidTemplate} ${statusTemplate}`}
          onClick={() => { handleSelectedTemplate(t.id); }} data-cy="project-template-card">
          <CardBody className="p-1">
            <img src={imgSrc} alt={t.id + " template image"} />
          </CardBody>
          <CardFooter className="p-1">
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
        <FontAwesomeIcon id={repositoryInfoId} className="ms-2" icon={faQuestionCircle} />
      </p>
      <UncontrolledPopover target={repositoryInfoId} trigger="legacy" placement="bottom">
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
      <Row className="row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5">{elements}</Row>
    </div>
  );
}

export default TemplateSelector;
