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
import React, { MouseEventHandler, useState } from "react";
import ShareLinkModal from "./ShareLinkModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink } from "@fortawesome/free-solid-svg-icons";
import { ButtonWithMenu } from "../../../utils/components/buttons/Button";
import { Button, DropdownItem } from "../../../utils/ts-wrappers";
import { NewProjectInputs, NewProjectMeta } from "./newProject.d";

interface SubmitFormButtonProps {
  input: NewProjectInputs;
  meta: NewProjectMeta;
  importingDataset: boolean;
  handlers: {
    createEncodedUrl: Function;
    onSubmit: MouseEventHandler<HTMLButtonElement>;
  };
}

const SubmitFormButton = ({ input, meta, importingDataset, handlers }: SubmitFormButtonProps) => {
  const [showModal, setShotModal] = useState(false);
  const toggleModal = () => {
    setShotModal((showModal) => !showModal);
  };
  const shareLinkModal = (
    <ShareLinkModal
      show={showModal}
      toggle={toggleModal}
      input={input}
      meta={meta}
      createUrl={handlers.createEncodedUrl}
    />
  );

  const createProject = (
    <Button id="create-new-project" color="secondary" data-cy="create-project-button" onClick={handlers.onSubmit}>
      {" "}
      Create project
    </Button>
  );
  const createLink = (
    <DropdownItem onClick={toggleModal}>
      <FontAwesomeIcon icon={faLink} /> Create link
    </DropdownItem>
  );
  // when is also importing a new dataset show a different submit button
  const button = !importingDataset ? (
    <ButtonWithMenu color="rk-green" default={createProject} direction="up">
      {createLink}
    </ButtonWithMenu>
  ) : (
    <Button data-cy="add-dataset-submit-button" id="create-new-project" color="rk-pink" onClick={handlers.onSubmit}>
      Add Dataset New Project
    </Button>
  );

  return (
    <>
      {shareLinkModal}
      <div className="mt-4 d-flex justify-content-end">{button}</div>
    </>
  );
};

export default SubmitFormButton;
