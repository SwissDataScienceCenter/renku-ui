/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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
 *  ProjectAvatar.container.js
 *  ProjectAvatar container and present code.
 */

import { Button } from "reactstrap";
import React, { useEffect, useState } from "react";

import ImageInput, { ImageFieldPropertyName as Prop } from "../../utils/components/formgenerator/fields/ImageInput";
import { ImageInputMode } from "../../utils/components/formgenerator/fields/ImageInput";
import { ExternalLink } from "../../utils/components/ExternalLinks";
import { InlineSubmitButton } from "../../utils/components/Button";

const CURRENT_AVATAR_NAME = "[Current Avatar]";

function ProjectAvatarSubmitButtons(
  { value, onCancel, onAvatarChange, externalUrl, readOnly, updated, submitting, pristine }) {

  if (readOnly)
    return null;
  // No options, no submit button
  if (value.options.length < 1) return null;
  // The current avatar is selected, no submit button
  if ((value.selected > -1) && (value.options[value.selected][Prop.NAME] === CURRENT_AVATAR_NAME)) return null;

  const removeAvatarUrl = `${externalUrl}/edit`;

  if (value.selected < 0) {
    // The current avatar is empty and selected, no submit button
    if (value.options[0][Prop.NAME] !== CURRENT_AVATAR_NAME) return null;
    // The user wants to remove the avatar -- need to go to GitLab for this
    return <div className="d-flex flex-row-reverse">
      <div>Please remove the avatar in <ExternalLink url={removeAvatarUrl} title="GitLab" /></div>
    </div>;
  }

  const submit = () => {
    onAvatarChange(selectedFile);
  };

  const selectedFile = value.options[value.selected][Prop.FILE];
  const submitButton = <InlineSubmitButton
    id="update-avatar"
    submittingText="Updating"
    doneText="Avatar Updated"
    text="Submit"
    isDone={updated}
    isReadOnly={readOnly || pristine}
    isSubmitting={submitting}
    onSubmit={submit}
    pristine={pristine}
    textPristine="Select Image to enable button"
  />;

  return <div className="d-flex flex-row-reverse">
    <div>
      {submitButton}
    </div>
    { !updated ?
      <div className="pe-3">
        <Button outline={true} disabled={submitting} color="primary"
          onClick={(e) => { onCancel(); }}>
          Cancel
        </Button>
      </div> : null }
  </div>;
}

function ProjectAvatarEdit({ avatarUrl, onAvatarChange, externalUrl, settingsReadOnly }) {
  const initial =
    (avatarUrl) ?
      { options: [{ [Prop.NAME]: CURRENT_AVATAR_NAME, [Prop.URL]: avatarUrl }], selected: 0 } :
      { options: [], selected: -1 };
  const [value, setValue] = useState(initial);
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [pristine, setPristine] = useState(true);

  useEffect(() => {
    setAlert(null);
  }, [value.selected]);

  const onCancel = () => {
    setValue(initial);
    setUpdated(false);
  };

  const changeValue = (value) => {
    setUpdated(false);
    setValue(value);
    setPristine(false);
  };

  const submitAvatar = (f) => {
    setSubmitting(true);
    return onAvatarChange(f)
      .then(() => setUpdated(true))
      .finally(() => setSubmitting(false))
      .catch(e => { setAlert(e.errorData.message.avatar); });
  };

  const maxSize = 200 * 1024; // 200KB
  // format: image/png, image/jpeg, image/gif, image/tiff
  return <div className="mb-3">
    <ImageInput name="project-avatar"
      label="Project Avatar"
      value={value}
      help={null}
      maxSize={maxSize}
      alert={alert}
      modes={[ImageInputMode.FILE]}
      format="image/png,image/jpeg,image/gif,image/tiff"
      disabled={settingsReadOnly}
      submitting={submitting}
      setInputs={(e) => { changeValue(e.target.value); }} />
    <ProjectAvatarSubmitButtons value={value}
      onCancel={onCancel}
      externalUrl={externalUrl}
      readOnly={settingsReadOnly || pristine}
      updated={updated}
      submitting={submitting}
      pristine={pristine}
      onAvatarChange={(f) => submitAvatar(f)} />
  </div>;

}

export { ProjectAvatarEdit };
