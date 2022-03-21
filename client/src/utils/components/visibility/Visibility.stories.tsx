import React from "react";
import { Story } from "@storybook/react";
import VisibilityInput, { Visibilities, VisibilityInputProps } from "./Visibility";
export default {
  title: "components/Visibility",
  component: VisibilityInput,
  argTypes: {
    namespaceVisibility: {
      options: Visibilities,
      control: { type: "select" },
      description: "according to the namespace some options are automatically disabled unless the" +
        "\"disabled\" option is activated which forces it to disable all the options"
    },
    value: {
      options: Visibilities,
      control: { type: "select" },
    },
    disabled: {
      control: { type: "boolean" },
      description: "forces to disable all the options"
    },
    isInvalid: {
      control: { type: "boolean" },
      description: "isRequired must be set to true for it to take effect",
    },
    isRequired: {
      control: { type: "boolean" },
    }
  },
};


const Template: Story<VisibilityInputProps> = (args) => <VisibilityInput {...args} />;

export const Default = Template.bind({});
Default.args = {
  namespaceVisibility: Visibilities.Public,
  value: Visibilities.Internal
};

export const NoNamespace = Template.bind({});
NoNamespace.args = {
  namespaceVisibility: undefined,
};

export const Disabled = Template.bind({});
Disabled.args = {
  namespaceVisibility: Visibilities.Public,
  disabled: true,
};

export const Invalid = Template.bind({});
Invalid.args = {
  namespaceVisibility: Visibilities.Public,
  isRequired: true,
  isInvalid: true
};

export const Limited = Template.bind({});
Limited.args = {
  namespaceVisibility: Visibilities.Private,
};
