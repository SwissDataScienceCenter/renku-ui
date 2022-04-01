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
import ProgressIndicator, { ProgressIndicatorProps, ProgressStyle, ProgressType } from "./Progress";

export default {
  title: "components/ProgressIndicator",
  component: ProgressIndicator,
  argTypes: {
    title: {
      control: { type: "text" },
      description: "Main title"
    },
    description: {
      control: { type: "text" },
      description: "subtitle",
    },
    style: {
      control: { type: "radio" },
      options: ProgressStyle,
      description: "Style for background. Light or Dark"
    },
    type: {
      control: { type: "radio" },
      options: [ProgressType.Determinate, ProgressType.Indeterminate],
      description: "Type of progress-bar. Indeterminate or Determinate"
    },
    percentage: {
      control: {
        type: "range",
        min: 0,
        max: 100,
      },
    },
    currentStatus: {
      control: {
        type: "text"
      },
    },
    feedback: {
      control: { type: "text" },
      description: "Text to indicate next step after the process is completed"
    }
  },
};

const Template: Story<ProgressIndicatorProps> = (args) => <ProgressIndicator {...args} />;
export const Default = Template.bind({});
Default.args = {
  title: "Creating Project",
  description: "We've receive your project information. This may take a while.",
  type: ProgressType.Indeterminate,
  style: ProgressStyle.Dark,
  percentage: undefined,
  currentStatus: undefined,
  feedback: "We will notify you when the process is completed",
};

export const Determinate = Template.bind({});
Determinate.args = {
  type: ProgressType.Determinate,
  style: ProgressStyle.Dark,
  title: "Creating Project",
  description: "We've receive your project information. This may take a while.",
  percentage: 10,
  currentStatus: "Knowledge Graph is building... ",
  feedback: "You'll be redirected to the new project page when the creation is completed.",
};

export const LightStyle = Template.bind({});
LightStyle.args = {
  type: ProgressType.Determinate,
  style: ProgressStyle.Light,
  title: "Creating Project",
  description: "We've receive your project information. This may take a while.",
  percentage: 60,
  currentStatus: "Knowledge Graph is building... ",
  feedback: "You'll be redirected to the new project page when the creation is completed.",
};
