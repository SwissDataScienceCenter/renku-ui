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

import {
  ErrorLabel,
  HelperLabel,
  InputHintLabel,
  InputLabel,
  LoadingLabel,
} from "./FormLabels";
import { Meta, StoryObj } from "@storybook/react";
import { LabelProps } from "reactstrap";

const meta: Meta<typeof InputLabel> = {
  title: "Components/Forms/Labels",
  component: InputLabel,
};
export default meta;
type Story = StoryObj<typeof InputLabel>;

export const Default: Story = {
  args: {
    text: "My Label",
  },
};

export const Required: Story = {
  args: {
    text: "My Label",
    isRequired: true,
  },
};

export const Optional: Story = {
  args: {
    text: "My Label",
    isRequired: false,
  },
};

export const Loading = {
  render: (args: LabelProps) => <LoadingLabel text={args.text} />,
  args: {
    text: "Fetching templates...",
  },
};

type StoryHelper = StoryObj<typeof HelperLabel>;
export const Helper: StoryHelper = {
  render: (args) => <HelperLabel text={args.text} />,
  args: {
    text: "Fetch templates first, or switch template source to RenkuLab",
  },
};

export const InputHint = {
  render: (args: LabelProps) => <InputHintLabel text={args.text} />,
  args: {
    text: "Provide a number between 0 and 9",
  },
};

export const Error = {
  render: (args: LabelProps) => <ErrorLabel text={args.text} />,
  args: {
    text: "Please select a template",
  },
};
