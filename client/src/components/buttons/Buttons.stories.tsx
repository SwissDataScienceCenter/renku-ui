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
import { Button } from "../../utils/ts-wrappers";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Meta, StoryObj } from "@storybook/react";

interface LabelsProps {
  text: string;
  isRequired: boolean;
}

const componentDescription = `
  Custom Buttons for actions in forms, cards, and more.
  Utilize a defined color palette for various states and entities.
  - **Entities:** Projects, Datasets and Workflows
  - **States:** Error, Information, Alert
 
<details>
<summary>Best Practices</summary>
<ul>
<li>Use labels that accurately describe the action the button performs. Frame the label as an action the user is taking, such as "Submit," "Save," "Cancel," "Delete," "Edit," etc.</li>
<li>Ensure that the design and color of the button align with the context in which it's used. For example, use primary buttons for main actions and secondary buttons for less prominent actions.</li>
<li>Don't overload a single page or section with too many buttons. Prioritize the most essential actions to avoid overwhelming users.</li>
<li>For modals and single-page forms right-align buttons with the container.</li>
<li>Always place the primary button on the right, the secondary button just to the left of it.</li>
</ul>
</details>

###ReactstrapComponents
This component uses Button from reactstrap internally. So please take a look also there at their extensive documentation.

`;
const meta: Meta<typeof Button> = {
  component: Button,
  title: "components/Buttons/Normal Buttons",

  parameters: {
    docs: {
      description: {
        component: componentDescription,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;
export const Primary: Story = (args: LabelsProps) => (
  <>
    <Button className="btn-rk-green">{args.text}</Button>
  </>
);
Primary.args = {
  text: "Create Project",
};
Primary.parameters = {
  docs: {
    description: {
      story:
        "This is the primary button variant. Use this for the main action.",
    },
  },
};

export const Secondary: Story = (args: LabelsProps) => (
  <>
    <Button className="btn-outline-rk-green">{args.text}</Button>
  </>
);
Secondary.args = {
  text: "Cancel",
};
Secondary.parameters = {
  docs: {
    description: {
      story:
        "The secondary button is used for actions we don't want to emphasize too much (E.G: a `Cancel` button in a modal) or actions that are not required (E.G: `Add Variable` in the new session page to add an optional environment variable)",
    },
  },
};

export const WithIcon: Story = (args: LabelsProps) => (
  <>
    <Button className="btn-rk-green btn-icon-text">
      <FontAwesomeIcon icon={faPen} color="dark" />
      {args.text}
    </Button>
  </>
);
WithIcon.args = {
  text: "Edit Project",
};
WithIcon.parameters = {
  docs: {
    description: {
      story:
        "Here is a variation including an icon. Mind it always goes on the left.",
    },
  },
};

export const Project = (args: LabelsProps) => (
  <>
    <Button className="btn-rk-green">{args.text}</Button>
  </>
);
Project.args = {
  text: "My Button",
};
Project.parameters = {
  docs: {
    description: {
      story: 'Use the class "btn-rk-green" when working on project components.',
    },
  },
};
export const Datasets = (args: LabelsProps) => (
  <>
    <Button className="btn-rk-pink">{args.text}</Button>
  </>
);
Datasets.args = {
  text: "My Button",
};
Datasets.parameters = {
  docs: {
    description: {
      story: 'Use the class "btn-rk-pink" when working on dataset components.',
    },
  },
};

export const Workflows = (args: LabelsProps) => (
  <>
    <Button className="btn-rk-yellow">{args.text}</Button>
  </>
);
Workflows.args = {
  text: "My Button",
};
Workflows.parameters = {
  docs: {
    description: {
      story:
        'Use the class "btn-rk-yellow" when working on workflow components.',
    },
  },
};

export const Informative = (args: LabelsProps) => (
  <>
    <Button className="btn-info">{args.text}</Button>
  </>
);
Informative.args = {
  text: "Update Version",
};
Informative.parameters = {
  docs: {
    description: {
      story:
        "Use `btn-info` in the context of an Info alert or to enhance user experience by offering context or supplementary actions. It is not associated with critical actions. E.G `Update Version`.",
    },
  },
};

export const Warning = (args: LabelsProps) => (
  <>
    <Button className="btn-warning">{args.text}</Button>
  </>
);
Warning.args = {
  text: "Discard Changes",
};
Warning.parameters = {
  docs: {
    description: {
      story:
        "Use `btn-warning` in the context of a Warning Alert, or to signal caution or potential risks. It is employed for actions that might have consequences but can still be undone or rectified.",
    },
  },
};

export const Error = (args: LabelsProps) => (
  <>
    <Button className="btn-danger">{args.text}</Button>
  </>
);
Error.args = {
  text: "Delete Project",
};
Error.parameters = {
  docs: {
    description: {
      story:
        "Use `btn-danger` in the context of a Danger Alert, or when suggesting a high-risk actions action that can lead to critical or irreversible outcomes. (E.G. `Delete Project` or updating a project when it is on a very outdated version not supported anymore by the UI).",
    },
  },
};
