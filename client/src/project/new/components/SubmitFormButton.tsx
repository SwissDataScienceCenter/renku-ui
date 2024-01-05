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
 *  SubmitFormButton.tsx
 *  Submit Button create new project
 */
import { useState } from "react";
import ShareLinkModal from "./ShareLinkModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { ButtonWithMenu } from "../../../components/buttons/Button";
import { Button, DropdownItem } from "../../../utils/ts-wrappers";
import { SubmitHandler, UseFormGetValues } from "react-hook-form";
import { NewProjectFormFields } from "../../../features/project/projectKg.types";
import { createEncodedNewProjectUrl } from "../../../features/project/editNew/NewProject.utils";

interface SubmitFormButtonProps {
  createDataAvailable: boolean;
  onSubmit: SubmitHandler<NewProjectFormFields>;
  importingDataset: boolean;
  getValues: UseFormGetValues<NewProjectFormFields>;
}

function ImportSubmitFormButton({
  onSubmit,
}: Pick<SubmitFormButtonProps, "onSubmit">) {
  return (
    <>
      <div className="mt-4 d-flex justify-content-end">
        <Button
          data-cy="add-dataset-submit-button"
          id="create-new-project"
          color="rk-pink"
          onClick={onSubmit}
        >
          Add Dataset New Project
        </Button>
      </div>
    </>
  );
}

function StandardSubmitFormButton({
  createDataAvailable,
  onSubmit,
  getValues,
}: Omit<SubmitFormButtonProps, "importingDataset">) {
  const [showModal, setShotModal] = useState(false);
  const toggleModal = () => {
    setShotModal((showModal) => !showModal);
  };

  const input = getValues();
  // TODO: Set all values needed for ShareLinkModal

  const shareLinkModal = (
    <ShareLinkModal
      show={showModal}
      toggle={toggleModal}
      input={input}
      createUrl={createEncodedNewProjectUrl}
    />
  );

  const createProject = (
    <Button
      id="create-new-project"
      color="secondary"
      data-cy="create-project-button"
      disabled={!createDataAvailable}
      onClick={onSubmit}
    >
      {" "}
      Create project
    </Button>
  );
  const createLink = (
    <DropdownItem onClick={toggleModal}>
      <FontAwesomeIcon icon={faLink} /> Create link
    </DropdownItem>
  );

  return (
    <>
      {shareLinkModal}
      <div className="mt-4 d-flex justify-content-end">
        <ButtonWithMenu
          color="rk-green"
          default={createProject}
          direction="up"
          isPrincipal={true}
        >
          {createLink}
        </ButtonWithMenu>
      </div>
    </>
  );
}

function SubmitFormButton({
  createDataAvailable,
  onSubmit,
  importingDataset,
  getValues,
}: SubmitFormButtonProps) {
  if (importingDataset) {
    return <ImportSubmitFormButton onSubmit={onSubmit} />;
  }
  return (
    <StandardSubmitFormButton
      {...{ createDataAvailable, onSubmit, getValues }}
    />
  );
}

export default SubmitFormButton;
