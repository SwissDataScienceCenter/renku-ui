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
import * as React from "react";
import { Story } from "@storybook/react";
import VisibilityInput, { Visibilities, VisibilityInputProps } from "./Visibility";

export default {
  title: "components/Visibility",
  component: VisibilityInput,
  argTypes: {
    namespaceVisibility: {
      options: Visibilities,
      control: { type: "select" },
      description: "according to the namespace some options are automatically disabled unless the" +
        "\"disabled\" option is activated which forces it to disable all the options"
    },
    value: {
      options: Visibilities,
      control: { type: "select" },
    },
    disabled: {
      control: { type: "boolean" },
      description: "forces to disable all the options"
    },
    isInvalid: {
      control: { type: "boolean" },
      description: "isRequired must be set to true for it to take effect",
    },
    isRequired: {
      control: { type: "boolean" },
    },
    name: {
      control: {
        type: "text"
      },
      description: "To customize input name. Default: visibility"
    }
  },
};


const Template: Story<VisibilityInputProps> = (args) => <VisibilityInput {...args} />;

export const Default = Template.bind({});
Default.args = {
  namespaceVisibility: Visibilities.Public,
  value: Visibilities.Internal
};

export const NoNamespace = Template.bind({});
NoNamespace.args = {
  namespaceVisibility: undefined,
  name: "visibility2"
};

export const Disabled = Template.bind({});
Disabled.args = {
  namespaceVisibility: Visibilities.Public,
  disabled: true,
  name: "visibility3"
};

export const Invalid = Template.bind({});
Invalid.args = {
  namespaceVisibility: Visibilities.Public,
  isRequired: true,
  isInvalid: true,
  name: "visibility4"
};

export const Limited = Template.bind({});
Limited.args = {
  namespaceVisibility: Visibilities.Private,
  name: "visibility5"
};
