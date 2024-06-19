import cx from "classnames";
import { Meta, StoryObj } from "@storybook/react";
import { PencilSquare } from "react-bootstrap-icons";
import { Button } from "reactstrap";

export default {
  args: {
    color: "primary",
    size: "md",
    text: "Button text",
  },
  argTypes: {
    color: {
      description: "Color scheme to apply to the button.",
      type: {
        name: "enum",
        value: [
          "primary",
          "outline-primary",
          "secondary",
          "outline-secondary",
          "success",
          "outline-success",
          "info",
          "outline-info",
          "warning",
          "outline-warning",
          "danger",
          "outline-danger",
        ],
      },
    },
    size: {
      description: "Button size.",
      type: {
        name: "enum",
        value: ["sm", "md", "lg"],
      },
    },
    text: {
      description: "Text to display on the button.",
      type: {
        name: "string",
      },
    },
  },
  title: "Bootstrap/Button",
} as Meta;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
}
type Story = StoryObj<ButtonProps>;

export const Button_: Story = {
  render: ({ text, ..._args }) => <Button {..._args}>{text}</Button>,
};

export const ButtonWithIcon_: Story = {
  render: ({ text, ..._args }) => (
    <Button {..._args}>
      <PencilSquare className={cx("me-2", "text-icon")} />
      {text}
    </Button>
  ),
};
