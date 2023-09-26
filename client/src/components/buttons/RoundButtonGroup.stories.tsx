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
import { Button } from "../../utils/ts-wrappers";
import { RoundButtonGroup } from "./Button";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Button> = {
  component: RoundButtonGroup,
  title: "components/Buttons/RoundButtonGroup",
  parameters: {
    docs: {
      description: {
        component:
          "Group a series of buttons together on a single line or stack",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RoundButtonGroup>;

export const Default: Story = {
  render: () => {
    return (
      <RoundButtonGroup>
        <Button key="button-x" className="btn-outline-rk-green">
          Fork
        </Button>
        <Button key="button-y" className="btn-outline-rk-green">
          15
        </Button>
      </RoundButtonGroup>
    );
  },
};

export const MultipleButtons: Story = {
  render: () => {
    return (
      <RoundButtonGroup>
        <Button key="button-x" className="btn-outline-rk-green">
          Pull
        </Button>
        <Button key="button-y" className="btn-outline-rk-green">
          Push
        </Button>
        <Button key="button-z" className="btn-outline-rk-green">
          Merge
        </Button>
      </RoundButtonGroup>
    );
  },
};
