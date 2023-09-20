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

import { userEvent } from "@storybook/testing-library";
import { expect } from "@storybook/jest";
import { ButtonWithMenu } from "./Button";
import { StoryObj } from "@storybook/react";
import { DropdownItem } from "reactstrap";
import { Button } from "../../utils/ts-wrappers";

export default {
  component: ButtonWithMenu,
  title: "components/Buttons/ButtonWithMenu",
};
type Story = StoryObj<typeof ButtonWithMenu>;

const defaultAction = <Button key="button-main-primary">Main Action</Button>;
const options = [
  <DropdownItem key="option-a" data-cy="option-a">
    Option A
  </DropdownItem>,
  <DropdownItem key="option-b" data-cy="option-b">
    Option B
  </DropdownItem>,
];
export const Primary: Story = {
  args: {
    children: options,
    default: defaultAction,
    isPrincipal: true,
    color: "rk-green",
  },
  argTypes: {
    children: {
      table: {
        disable: true,
      },
    },
    default: {
      table: {
        disable: true,
      },
    },
    isPrincipal: {
      table: {
        disable: true,
      },
    },
    color: {
      table: {
        disable: true,
      },
    },
    className: {
      table: {
        disable: true,
      },
    },
    direction: {
      table: {
        disable: true,
      },
    },
    id: {
      table: {
        disable: true,
      },
    },
    size: {
      table: {
        disable: true,
      },
    },
  },
  parameters: {
    docs: {
      story: { height: "150px" },
    },
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      canvasElement.querySelector('[data-cy="more-menu"]') as Element
    );
    await expect(
      canvasElement.querySelector('[data-cy="option-a"]') as Element
    ).toBeVisible();
  },
};

const defaultActionSecondary = (
  <Button key="button-a" className="btn-outline-rk-green">
    Main Action
  </Button>
);

export const Secondary: Story = {
  args: {
    children: options,
    default: defaultActionSecondary,
    isPrincipal: false,
    color: "rk-green",
  },
  parameters: {
    docs: {
      story: { height: "150px" },
    },
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      canvasElement.querySelector('[data-cy="more-menu"]') as Element
    );
    await expect(
      canvasElement.querySelector('[data-cy="option-b"]') as Element
    ).toBeVisible();
  },
};
