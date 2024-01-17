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
import { useState } from "react";
import { Meta } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import InlineSubmitImageInput, {
  ImageValue,
  INITIAL_IMAGE_VALUE,
  InlineImageInputProps,
} from "./InlineSubmitImageInput";

const meta: Meta = {
  title: "components/Forms/InlineSubmitImageInput",
  component: InlineSubmitImageInput,
  parameters: {
    docs: {
      description: {
        component: `Inline Submit Image Input combines an input field with a submit button inline used in user interfaces 
          to allow users to quickly submit an image without navigating to a different page or section of the application.`,
      },
    },
  },
  args: {
    alert: "",
    color: "green",
    classNameSubmitButton: "updateProjectSettings",
    currentImageName: "",
    doneText: "Updated",
    includeRequiredLabel: true,
    imageMaxSize: 1024000,
    isDisabled: false,
    isDone: false,
    isSubmitting: false,
    label: "Project Image",
    name: "projectImage",
    onCancel: () => {
      return "";
    },
    onChange: () => {
      return "";
    },
    onSubmit: () => {
      return "";
    },
    pristine: false,
    readOnly: false,
    submitButtonId: "project-button-id",
    value: null,
  },
};
export default meta;

export const Default = (_args: InlineImageInputProps) => {
  const [value, setValue] = useState<ImageValue>();

  return (
    <InlineSubmitImageInput
      {..._args}
      value={value ?? INITIAL_IMAGE_VALUE}
      onChange={(newValue) => {
        action("setValue")(newValue);
        setValue(newValue);
      }}
    />
  );
};
