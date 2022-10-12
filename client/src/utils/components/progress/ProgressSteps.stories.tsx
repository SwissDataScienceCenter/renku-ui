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
import { ProgressStyle, ProgressType } from "./Progress";
import ProgressStepsIndicator, { ProgressStepsIndicatorProps, StepsProgressBar } from "./ProgressSteps";

export default {
  title: "components/ProgressStepsIndicator",
  component: ProgressStepsIndicator,
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
    message: {
      control: {
        type: "text"
      },
    },
  },
};
const status = {
  "details": [{
    "id": 1,
    "status": "ready",
    "step": "Initialization"
  }, {
    "id": 2,
    "status": "ready",
    "step": "Downloading session image"
  }, {
    "id": 3,
    "status": "executing",
    "step": "Cloning and configuring the repository"
  }, {
    "id": 4,
    "status": "waiting",
    "step": "Git credentials services"
  }, {
    "id": 5,
    "status": "waiting",
    "step": "Authentication and proxying services"
  }, {
    "id": 6,
    "status": "waiting",
    "step": "Auxiliary session services"
  }, {
    "id": 7,
    "status": "failed",
    "step": "Starting session"
  }],
  "message": "Containers with non-ready statuses: git-proxy, git-sidecar, jupyter-server, oauth2-proxy.",
  "readyNumContainers": 2,
  "state": "starting",
  "totalNumContainers": 7,
};

const Template: Story<ProgressStepsIndicatorProps> = (args) => <ProgressStepsIndicator {...args} />;
export const Default = Template.bind({});
Default.args = {
  title: "Starting Session (continuing from autosave)",
  description: "Starting the containers for your session",
  type: ProgressType.Determinate,
  style: ProgressStyle.Dark,
  status: status.details as StepsProgressBar[],
};

