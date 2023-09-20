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

import { useEffect, useState } from "react";

import { ImageFieldPropertyName as Prop } from "../../components/form-field/FormGeneratorImageInput";
import { ExternalLink } from "../../components/ExternalLinks";
import { PROJECT_AVATAR_MAX_SIZE } from "../new/components/NewProjectAvatar";
import InlineSubmitImageInput from "../../components/inlineSubmitImageInput/InlineSubmitImageInput";

const CURRENT_AVATAR_NAME = "[Current Avatar]";

function ProjectAvatarEdit({
  avatarUrl,
  onAvatarChange,
  externalUrl,
  settingsReadOnly,
  includeRequiredLabel = true,
}) {
  const initial = avatarUrl
    ? {
        options: [{ [Prop.NAME]: CURRENT_AVATAR_NAME, [Prop.URL]: avatarUrl }],
        selected: 0,
      }
    : { options: [], selected: -1 };
  const [value, setValue] = useState(initial);
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    setAlert(null);
  }, [value.selected, setAlert]);

  const onCancel = () => {
    setValue(initial);
    setUpdated(false);
  };

  const changeValue = (value) => {
    setUpdated(false);
    setValue(value);
  };

  const submitAvatar = (f) => {
    setSubmitting(true);
    return onAvatarChange(f)
      .then(() => setUpdated(true))
      .finally(() => setSubmitting(false))
      .catch((e) => {
        setAlert(e.errorData.message.avatar);
      });
  };

  const removeAvatarUrl = `${externalUrl}/edit`;

  if (value.selected < 0) {
    // The current avatar is empty and selected, no submit button
    if (value.options[0][Prop.NAME] !== CURRENT_AVATAR_NAME) return null;
    // The user wants to remove the avatar -- need to go to GitLab for this
    return (
      <div className="d-flex flex-row-reverse">
        <div>
          Please remove the avatar in{" "}
          <ExternalLink url={removeAvatarUrl} title="GitLab" />
        </div>
      </div>
    );
  }

  return (
    <InlineSubmitImageInput
      alert={alert}
      classNameSubmitButton=""
      currentImageName={CURRENT_AVATAR_NAME}
      doneText="Avatar Updated"
      includeRequiredLabel={includeRequiredLabel}
      imageMaxSize={PROJECT_AVATAR_MAX_SIZE}
      isDisabled={settingsReadOnly}
      isDone={updated}
      isSubmitting={submitting}
      label="Project Avatar"
      name="project-avatar"
      onCancel={onCancel}
      onChange={(value) => {
        changeValue(value);
      }}
      onSubmit={(f) => submitAvatar(f)}
      readOnly={settingsReadOnly}
      submitButtonId="update-avatar"
      initialValue={initial}
    />
  );
}

export { ProjectAvatarEdit };
