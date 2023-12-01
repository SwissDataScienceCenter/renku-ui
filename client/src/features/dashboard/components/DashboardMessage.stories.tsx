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
import { useContext, useEffect } from "react";

import AppContext from "../../../utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "../../../utils/context/appParams.constants";
import DashboardMessage from "./DashboardMessage";
import useAppDispatch from "../../../utils/customHooks/useAppDispatch.hook";
import { dashboardMessageSlice } from "../message/dashboardMessageSlice";

interface DashboardMessageArgs {
  enabled: boolean;
  text: string;
  additionalText: string;
  style: "plain" | "success" | "info" | "warning" | "danger";
  dismissible: boolean;
  dismissed: boolean;
}

const description = `
This component renders a message to be displayed on the Dashboard.

The message and its appearance can be customized by tweaking the
deployment values.
`.trim();

const defaultText = `
# Welcome to Renku! 🐸

You are running inside Storybook!

As you can see, this message supports UTF-8 characters and **Markdown** notation.
`.trim();

const meta: Meta<DashboardMessageArgs> = {
  args: {
    enabled: true,
    text: defaultText,
    additionalText: "",
    style: "info",
    dismissible: false,
    dismissed: false,
  },
  argTypes: {
    enabled: { type: "boolean" },
    text: { type: "string" },
    additionalText: { type: "string" },
    style: {
      type: {
        name: "enum",
        value: ["plain", "success", "info", "warning", "danger"],
      },
      control: "select",
    },
    dismissible: { type: "boolean" },
    dismissed: {
      control: "boolean",
      // [ARG_REDUX_PATH]: "dashboardMessage.dismissed",
    },
  },
  component: DashboardMessage,
  decorators: [
    // Add some background around the component, to show the white background
    // used by the "plain" style.
    (Story) => (
      <div className="p-3 bg-body">
        <Story />
      </div>
    ),
    // Setup the `params` in `AppContext` which control how the dashboard
    // message is rendered.
    (Story, { args }) => {
      const { enabled, text, additionalText, style, dismissible } = args;

      const existingContext = useContext(AppContext);
      const context = {
        ...existingContext,
        params: {
          ...DEFAULT_APP_PARAMS,
          DASHBOARD_MESSAGE: {
            enabled,
            text,
            additionalText,
            style,
            dismissible,
          },
        },
      };

      return (
        <AppContext.Provider value={context}>
          <Story />
        </AppContext.Provider>
      );
    },
    // Setup the `dismissed` control.
    (Story, { args }) => {
      const { dismissed } = args;
      const dispatch = useAppDispatch();

      useEffect(() => {
        if (dismissed) {
          dispatch(dashboardMessageSlice.actions.dismiss());
        } else {
          dispatch(dashboardMessageSlice.actions.undismiss());
        }
      }, [dismissed, dispatch]);

      return <Story />;
    },
  ],
  parameters: {
    docs: {
      description: {
        component: description,
      },
    },
  },
  title: "components/DashboardMessage",
};
export default meta;

type Story = StoryObj<typeof DashboardMessage>;

export const Default: Story = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render: (_args) => <DashboardMessage />,
};

export const WithAdditionalText: Story = {
  args: {
    additionalText: `
This is some additional text.

* It also supports **Markdown** notation.
`.trim(),
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render: (_args) => <DashboardMessage />,
};
