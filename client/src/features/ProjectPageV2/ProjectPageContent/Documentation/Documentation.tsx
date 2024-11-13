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
import { useCallback, useState } from "react";

import { FileEarmarkText } from "react-bootstrap-icons";
import { Card, CardBody, CardHeader, ListGroup } from "reactstrap";

import { EditSaveButton } from "../../../../components/buttons/Button";

import { Project } from "../../../projectsV2/api/projectV2.api";
import { usePatchProjectsByProjectIdMutation } from "../../../projectsV2/api/projectV2.enhanced-api";
import TextAreaInput from "../../../../components/form-field/TextAreaInput.tsx";
import { useForm } from "react-hook-form";
import { LazyCkEditorRenderer } from "../../../../components/form-field/LazyCkEditorRenderer.tsx";

interface DocumentationForm {
  description: string;
}

export default function Documentation({ project }: { project: Project }) {
  const [updateProject] = usePatchProjectsByProjectIdMutation();
  const [description, setDescription] = useState(project.documentation || "");

  const { control, handleSubmit, setValue, getValues, register } =
    useForm<DocumentationForm>();
  const onSubmit = useCallback(
    (data: DocumentationForm) => {
      setDescription(data.description);
      setShowEditor(false);
      updateProject({
        "If-Match": project.etag ? project.etag : "",
        projectId: project.id,
        projectPatch: { documentation: data.description },
      });
    },
    [project.etag, project.id, updateProject]
  );

  const [showEditor, setShowEditor] = useState(false);
  const toggle = () => {
    setShowEditor(!showEditor);
    setValue("description", description);
  };

  const markdownCharactersLimit = 5000;
  const aboutCharactersLimit =
    Math.floor(((2 / 3) * markdownCharactersLimit) / 10) * 10;
  const [charactersLimit, setCharactersLimit] = useState(aboutCharactersLimit);
  const [characters, setCharacters] = useState(0);
  const [disabledSaveButton, setDisabledSaveButton] = useState(false);

  const wordCount = (stats: {
    exact: boolean;
    characters: number;
    words: number;
  }) => {
    stats.exact
      ? setCharactersLimit(markdownCharactersLimit)
      : setCharactersLimit(aboutCharactersLimit);
    setCharacters(stats.characters);
  };

  const descriptionField = register("description");
  {
    const descriptionFieldTmp = descriptionField.onChange;
    descriptionField.onChange = (value) => {
      setDisabledSaveButton(false);
      return descriptionFieldTmp(value);
    };
  }

  return (
    <Card data-cy="project-documentation-card">
      <form className="form-rk-pink" onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <div
            className={cx(
              "align-items-center",
              "d-flex",
              "justify-content-between"
            )}
          >
            <h4 className="m-0">
              <FileEarmarkText className={cx("me-1", "bi")} />
              Documentation
            </h4>
            <span>
              {showEditor ? (
                <span style={{ verticalAlign: "middle" }}>
                  {characters} of
                  {charactersLimit == aboutCharactersLimit ? " about " : " "}
                  {charactersLimit} characters &nbsp;
                </span>
              ) : (
                <></>
              )}
              <EditSaveButton
                data-cy="project-documentation-edit"
                toggle={toggle}
                disabled={disabledSaveButton}
                // tooltip="Save or discard your changes."
                checksBeforeSave={() => {
                  if (
                    getValues("description").length <= markdownCharactersLimit
                  ) {
                    return true;
                  }
                  setDisabledSaveButton(true);
                  return false;
                }}
                checksBeforeSaveTooltipMessage={() =>
                  `Documentation is too long.\n The document can not be longer\nthan ${markdownCharactersLimit} characters.`
                }
              />
            </span>
          </div>
        </CardHeader>
        <CardBody>
          {showEditor ? (
            <ListGroup flush>
              <TextAreaInput<DocumentationForm>
                control={control}
                getValue={() => getValues("description")}
                name="description"
                register={descriptionField}
                wordCount={wordCount}
              />
            </ListGroup>
          ) : (
            <ListGroup flush>
              <div className="pb-2"></div>
              <LazyCkEditorRenderer name="description" data={description} />
            </ListGroup>
          )}
        </CardBody>
      </form>
    </Card>
  );
}
