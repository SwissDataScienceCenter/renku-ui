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

import ImageInput, { ImageFieldPropertyName as Prop } from "../../utils/formgenerator/fields/ImageInput";
import { ImageInputMode } from "../../utils/formgenerator/fields/ImageInput";
import { ExternalLink } from "../../utils/UIComponents";

const CURRENT_AVATAR_NAME = "[Current Avatar]";

function ProjectAvatarSubmitButtons({ value, onCancel, onAvatarChange, externalUrl }) {
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


  const selectedFile = value.options[value.selected][Prop.FILE];
  return <div className="d-flex flex-row-reverse">
    <div>
      <Button color="primary"
        onClick={(e) => { onAvatarChange(selectedFile); }}>
        Submit
      </Button>
    </div>
    <div className="pe-3">
      <Button
        onClick={(e) => { onCancel(); }}>
        Cancel
      </Button>
    </div>
  </div>;
}

function ProjectAvatarEdit({ avatarUrl, onAvatarChange, externalUrl, settingsReadOnly }) {
  const initial =
    (avatarUrl) ?
      { options: [{ [Prop.NAME]: CURRENT_AVATAR_NAME, [Prop.URL]: avatarUrl }], selected: 0 } :
      { options: [], selected: -1 };
  const [value, setValue] = useState(initial);
  const [alert, setAlert] = useState(null);
  useEffect(() => {
    setAlert(null);
  }, [value.selected]);
  const maxSize = 200 * 1024; // 200KB
  // format: image/png, image/jpeg, image/gif, image/tiff
  return <div>
    <div>Project Avatar</div>
    <ImageInput name="project-avatar"
      value={value}
      help={null}
      maxSize={maxSize}
      alert={alert}
      modes={[ImageInputMode.FILE]}
      format="image/png,image/jpeg,image/gif,image/tiff"
      disabled={settingsReadOnly}
      setInputs={(e) => { setValue(e.target.value); }} />
    <ProjectAvatarSubmitButtons value={value}
      onCancel={() => setValue(initial)}
      externalUrl={externalUrl}
      onAvatarChange={(f) => onAvatarChange(f).catch(e => { setAlert(e.errorData.message.avatar); })} />
  </div>;

}

export { ProjectAvatarEdit };
