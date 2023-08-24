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

/**
 *  renku-ui
 *
 *  ProjectAvatar.container.js
 *  ProjectAvatar container and present code.
 */

import { useEffect, useState } from "react";

import ImageInput from "../../../components/form-field/FormGeneratorImageInput";
import { ImageInputMode } from "../../../components/form-field/FormGeneratorImageInput";

// 3 MB -- GitLab has a 200kB limit, but a 3 MB file should be small enough after cropping
const PROJECT_AVATAR_MAX_SIZE = 3 * 1024 * 1024;

type ArtificialEventTargetValue = {
  options: { FILE: File }[];
  selected: number;
};

type ArtificialEvent = {
  target: { name: string; value: ArtificialEventTargetValue };
  isPersistent: () => false;
};

type NewProjectAvatarProps = {
  onAvatarChange: (arg: File) => void;
};
function NewProjectAvatar({ onAvatarChange }: NewProjectAvatarProps) {
  const initial: ArtificialEventTargetValue = { options: [], selected: -1 };
  const [value, setValue] = useState(initial);
  const [alert, setAlert] = useState(null);

  const setInputs = (e: ArtificialEvent) => {
    const value = e.target.value;
    setValue(value);
    onAvatarChange(value.options[value.selected].FILE);
  };

  useEffect(() => {
    setAlert(null);
  }, [value.selected]);

  // format: image/png, image/jpeg, image/gif, image/tiff
  return (
    <div className="mb-4">
      <ImageInput
        name="project-avatar"
        label="Project Avatar"
        value={value}
        help={null}
        maxSize={PROJECT_AVATAR_MAX_SIZE}
        alert={alert}
        modes={[ImageInputMode.FILE]}
        format="image/png,image/jpeg,image/gif,image/tiff"
        disabled={false}
        submitting={false}
        setInputs={setInputs}
      />
    </div>
  );
}

export default NewProjectAvatar;
export { PROJECT_AVATAR_MAX_SIZE };
