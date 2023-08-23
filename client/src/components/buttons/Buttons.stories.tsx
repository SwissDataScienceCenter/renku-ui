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
  - **Entities:** Projects, Datasets y Workflows
  - **States:** Error, Information, Alert
 
<details>
<summary>Best Practices</summary>
<ul>
<li>For modals and single-page forms right-align buttons with the container.</li>
<li>Always place the primary button on the right, the secondary button just to the left of it.</li>
</ul>
</details>
`;
const meta: Meta<typeof Button> = {
  component: Button,
  title: "components/Buttons",
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
  text: "My Button",
};
Primary.parameters = {
  docs: {
    description: {
      story: "This is the primary button variant, suitable for key actions.",
    },
  },
};

export const Secondary: Story = (args: LabelsProps) => (
  <>
    <Button className="btn-outline-rk-green">{args.text}</Button>
  </>
);
Secondary.args = {
  text: "My Button",
};
Secondary.parameters = {
  docs: {
    description: {
      story:
        "The secondary button is used for secondary or less emphasized actions.",
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
  text: "My Button",
};
WithIcon.parameters = {
  docs: {
    description: {
      story:
        "This variation when include icon, place icon to the left of the text",
    },
  },
};

export const SecondaryWithIcon = (args: LabelsProps) => (
  <>
    <Button className="btn-outline-rk-green btn-icon-text">
      <FontAwesomeIcon icon={faPen} color="dark" />
      {args.text}
    </Button>
  </>
);
SecondaryWithIcon.args = {
  text: "My Button",
};
SecondaryWithIcon.parameters = {
  docs: {
    description: {
      story:
        "This variation when include icon, place icon to the left of the text",
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
      story:
        'Apply the className "btn-rk-green" when utilizing the button for a project entity.',
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
      story:
        'Apply the className "btn-rk-pink" when utilizing the button for a dataset entity.',
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
        'Apply the className "btn-rk-yellow" when utilizing the button for a workflow entity.',
    },
  },
};

export const Informative = (args: LabelsProps) => (
  <>
    <Button className="btn-info">{args.text}</Button>
  </>
);
Informative.args = {
  text: "My Button",
};
Informative.parameters = {
  docs: {
    description: {
      story:
        'When employing a button for a non-entity-associated action that is not obligatory, apply the "btn-info" className.',
    },
  },
};

export const Error = (args: LabelsProps) => (
  <>
    <Button className="btn-danger">{args.text}</Button>
  </>
);
Error.args = {
  text: "My Button",
};
Error.parameters = {
  docs: {
    description: {
      story:
        'For a button that performs a potentially risky action leading to a change in operation state, apply the "btn-danger" className',
    },
  },
};
