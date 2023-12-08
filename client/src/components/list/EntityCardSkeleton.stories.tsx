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

import { Meta, StoryObj } from "@storybook/react";
import EntityCardSkeleton from "./EntityCardSkeleton";

const componentDescription = `
The **EntityCardSkeleton** component is a skeleton loading state
for an entity card. It is used to provide a visual representation while
data is being fetched or loaded asynchronously.

This component is particularly useful for creating a smooth user
experience by indicating that content is loading without displaying
empty or placeholder cards.
`;
const meta: Meta = {
  title: "components/Loaders/EntityCardSkeleton",
  component: EntityCardSkeleton,

  parameters: {
    docs: {
      description: {
        component: componentDescription,
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof EntityCardSkeleton>;
export const EntityCardSkeletonLoader: Story = {
  args: {
    includeBorder: true,
  },
};
