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
import { FormGeneratorCreatorsInput } from "./CreatorsInput";
import type { CreatorInputProps } from "./CreatorsInput";
import { Story } from "@storybook/react";

export default {
  title: "components/CreatorsInput",
  component: FormGeneratorCreatorsInput,
};

const Template: Story<CreatorInputProps> = (args) => (
  <FormGeneratorCreatorsInput {...args} />
);
export const Default = Template.bind({});
Default.args = {
  name: "author",
  label: "Creators",
  setInputs: () => true,
  value: [
    {
      id: 1,
      name: "E2E User",
      email: "e2e.test@renku.ch",
      affiliation: "creator",
      default: true,
    },
  ],
};
