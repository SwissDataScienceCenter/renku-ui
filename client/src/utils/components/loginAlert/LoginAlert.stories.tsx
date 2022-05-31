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

/**
 *  renku-ui
 *
 *  LoginAlert.stories.tsx
 *  LoginAlert component storybook
 */

import * as React from "react";
import { Story } from "@storybook/react";
// import { MemoryRouter } from "react-router-dom";
import LoginAlert, { LoginAlertProps } from "./LoginAlert";

// TODO: re-enable MemoryRouter as soon as the version is compatible again

export default {
  title: "components/LoginAlert",
  component: LoginAlert,
  argTypes: {
    logged: {
      control: { type: "boolean" },
      description: "Whether the user is logged or not.",
    },
    textIntro: {
      control: { type: "text" },
      description: "Additional text to show in a paragraph outside the Alert.",
    },
    textLogin: {
      control: { type: "text" },
      description: "Log in button text.",
    },
    textPost: {
      control: { type: "text" },
      description: "Text after the log in button.",
    },
    textPre: {
      control: { type: "text" },
      description: "Text before the log in button.",
    },
  },
};

// const Template: Story<LoginAlertProps> = (args) => (
//   <MemoryRouter>
//     <LoginAlert {...args} />
//   </MemoryRouter>
// );
const Template: Story<LoginAlertProps> = (args) => (
  <LoginAlert {...args} />
);

export const Complete = Template.bind({});
Complete.args = {
  logged: false,
  textLogin: "log in",
  textIntro: "You need to log in to modify workflows.",
  textPost: " and unleash your creativity.",
  textPre: "To unlock it, please ",
};

export const Default = Template.bind({});
Default.args = {
  logged: false,
};

export const Logged = Template.bind({});
Logged.args = {
  logged: true,
};
