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

import InlineSubmitInput from "./InlineSubmitInput";
import { ErrorAlert } from "../Alert";

const meta: Meta = {
  title: "components/Forms/InlineSubmitInput",
  component: InlineSubmitInput,
  parameters: {
    docs: {
      description: {
        component: `Inline Submit Input combines an input field with a submit button inline used in user interfaces 
          to allow users to quickly submit data without navigating to a different page or section of the application.`,
      },
    },
  },
  args: {
    classNameSubmitButton: "updateProjectSettings",
    dataCyCard: "settings-input",
    dataCyInput: "setting-input",
    disabled: false,
    doneText: "Updated",
    errorToDisplay: null,
    id: "projectKeywords",
    inputHint: "Comma-separated list of keywords",
    isDone: false,
    isSubmitting: false,
    label: "Input label",
    loading: false,
    onChange: () => {
      return "";
    },
    onSubmit: () => {
      return "";
    },
    pristine: false,
    readOnly: false,
    submittingText: "Updating",
    text: "Update",
    tooltipPristine: "Modify to update value",
    value: "",
  },
};
export default meta;

type Story = StoryObj<typeof InlineSubmitInput>;

const errorAlert = (
  <ErrorAlert dismissible={false}>
    <h5>Error 500</h5>
    <p className="mb-0">Error updating value</p>
  </ErrorAlert>
);

export const Default: Story = {};

export const LoadingValue: Story = {
  args: {
    loading: true,
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    value: "Value for this input",
  },
};

export const SubmittingChange: Story = {
  args: {
    isSubmitting: true,
  },
};

export const ChangeDone: Story = {
  args: {
    isDone: true,
  },
};

export const WhenError: Story = {
  args: {
    errorToDisplay: errorAlert,
  },
};
