import { Meta, StoryObj } from "@storybook/react";

import {
  ErrorAlert,
  InfoAlert,
  SuccessAlert,
  WarnAlert,
} from "./../../components/Alert";

export default {
  args: {
    dismissible: true,
    timeout: 0,
  },
  argTypes: {
    dismissible: {
      description: "Whether to show a close button to dismiss the alert.",
      type: "boolean",
    },
    timeout: {
      description:
        "The time in seconds to automatically dismiss the alert. Set to 0 to disable.",
      type: "number",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Alerts are used to communicate a state of a system or to notify the user of something.",
      },
    },
  },
  title: "Bootstrap/Alert",
} as Meta;

type Story = StoryObj<React.HTMLAttributes<HTMLDivElement>>;

export const WarnAlert_: Story = {
  render: (_args) => (
    <WarnAlert {..._args}>
      <h4>This is a warning alert</h4>
      <p className="m-0">
        It can be a warning for something that is not critical but still needs
        to be addressed. Or for something important to be aware of.
      </p>
    </WarnAlert>
  ),
};

export const ErrorAlert_: Story = {
  render: (_args) => (
    <ErrorAlert {..._args}>
      <h4>This is an error alert</h4>
      <p className="m-0">
        Use it to notify something critical that went wrong.
      </p>
    </ErrorAlert>
  ),
};

export const SuccessAlert_: Story = {
  render: (_args) => (
    <SuccessAlert {..._args}>
      <h4>This is a success alert</h4>
      <p className="m-0">Use it to notify something that was successful.</p>
    </SuccessAlert>
  ),
};

export const InfoAlert_: Story = {
  render: (_args) => (
    <InfoAlert {..._args}>
      <h4>This is an info alert</h4>
      <p className="m-0">
        This is a generic information that requires attention.
      </p>
    </InfoAlert>
  ),
};
