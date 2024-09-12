import cx from "classnames";
import { Meta, StoryObj } from "@storybook/react";
import { Pencil, PencilSquare, PlusLg, Trash } from "react-bootstrap-icons";
import {
  Button,
  ButtonGroup,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";
import React from "react";
import { ButtonWithMenuV2 } from "../../components/buttons/Button";

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
  parameters: {
    docs: {
      description: {
        component:
          "We generally use the primary color for the preferred action on a page and outline primary for the other buttons." +
          " If you need to show many possible actions, please consider using the Button with Dropdown. That allows combining multiple actions in a single button, including links styled properly.",
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

PencilSquare.displayName = "PencilSquare";

export const ButtonWithIcon_: Story = {
  render: ({ text, ..._args }) => (
    <Button {..._args}>
      <PencilSquare className={cx("bi", "me-1")} />
      {text}
    </Button>
  ),
};

PlusLg.displayName = "PlusLg";

export const IconOnly_: Story = {
  render: ({ ..._args }) => (
    <div className="d-flex gap-3">
      <Button {..._args} color="outline-primary">
        <PlusLg className="icon-text" />
      </Button>
      <Button {..._args} color="primary">
        <PlusLg className="icon-text" />
      </Button>
    </div>
  ),
};

export const ButtonWithDropdown_: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The badge size adjust automatically to the text size. Mind that vertical alignment might need to be adjusted with the flex classes depending on where the badge is used.",
      },
    },
  },
  render: () => (
    <>
      <ButtonWithMenuV2
        color="outline-primary"
        default={
          <Button
            className="text-nowrap"
            color="outline-primary"
            onClick={() => {}}
            size="sm"
          >
            <Pencil className={cx("bi", "me-1")} />
            Edit
          </Button>
        }
        preventPropagation
        size="sm"
      >
        <DropdownItem onClick={() => {}}>
          <Trash className={cx("bi", "me-1")} />
          Remove
        </DropdownItem>
      </ButtonWithMenuV2>
    </>
  ),
};

export const ButtonGroup_: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Useful for multiple selections whenever is makes sense to show all the options at once." +
          " You can play with Button Groups to add spacing and make them look better depending on the context. A good example is the search page filters as shown in the mobile version (make the browser smaller).",
      },
    },
  },
  render: () => (
    <>
      <ButtonGroup>
        <Button color="primary">Left</Button>
        <Button color="primary">Middle</Button>
        <Button color="primary">Right</Button>
      </ButtonGroup>
    </>
  ),
};
