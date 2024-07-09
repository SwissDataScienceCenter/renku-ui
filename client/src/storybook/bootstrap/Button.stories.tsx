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

export const ButtonIconOnly_: Story = {
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
      story: { height: "150px" },
      description: {
        story: "Used to ...",
      },
    },
  },
  render: () => (
    <>
      <div className="d-flex gap-3 my-3">
        <UncontrolledDropdown direction="down" group size="sm">
          <Button color="outline-primary">
            <PencilSquare className={cx("me-2", "text-icon")} /> Edit sm
          </Button>
          <DropdownToggle
            caret
            data-bs-toggle="dropdown"
            color="outline-primary"
          />
          <DropdownMenu>
            <DropdownItem>
              <Trash className={cx("me-2", "text-icon")} /> Remove
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
        <UncontrolledDropdown direction="down" group size="md">
          <Button color="primary">Launch sm</Button>
          <DropdownToggle caret data-bs-toggle="dropdown" color="primary" />
          <DropdownMenu>
            <DropdownItem>
              <Pencil className={cx("me-2", "text-icon")} /> Customize launch
            </DropdownItem>
            <DropdownItem>
              <Pencil className={cx("me-2", "text-icon")} /> Edit launch
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
      <div className="d-flex gap-3 my-3">
        <UncontrolledDropdown direction="down" group size="md">
          <Button color="outline-primary">
            <PencilSquare className={cx("me-2", "text-icon")} /> Edit md
          </Button>
          <DropdownToggle
            caret
            data-bs-toggle="dropdown"
            color="outline-primary"
          />
          <DropdownMenu>
            <DropdownItem>
              <Trash className={cx("me-2", "text-icon")} /> Remove
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
        <UncontrolledDropdown direction="down" group size="md">
          <Button color="primary">Launch md</Button>
          <DropdownToggle caret data-bs-toggle="dropdown" color="primary" />
          <DropdownMenu>
            <DropdownItem>
              <Pencil className={cx("me-2", "text-icon")} /> Customize launch
            </DropdownItem>
            <DropdownItem>
              <Pencil className={cx("me-2", "text-icon")} /> Edit launch
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
      <div className="d-flex gap-3 my-3">
        <UncontrolledDropdown direction="down" group size="lg">
          <Button color="outline-primary">
            <PencilSquare className={cx("me-2", "text-icon")} /> Edit lg
          </Button>
          <DropdownToggle
            caret
            data-bs-toggle="dropdown"
            color="outline-primary"
          />
          <DropdownMenu>
            <DropdownItem>
              <Trash className={cx("me-2", "text-icon")} /> Remove
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
        <UncontrolledDropdown direction="down" group size="lg">
          <Button color="primary">Launch lg</Button>
          <DropdownToggle caret data-bs-toggle="dropdown" color="primary" />
          <DropdownMenu>
            <DropdownItem>
              <Pencil className={cx("me-2", "text-icon")} /> Customize launch
            </DropdownItem>
            <DropdownItem>
              <Pencil className={cx("me-2", "text-icon")} /> Edit launch
            </DropdownItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    </>
  ),
};

export const ButtonGroup_: Story = {
  parameters: {
    docs: {
      story: { height: "150px" },
      description: {
        story:
          "Group a series of buttons together on a single line or stack them in a vertical column.",
      },
    },
  },
  render: () => (
    <>
      <div className="d-flex gap-3 my-3">
        <ButtonGroup>
          <Button color="primary">Left</Button>
          <Button color="primary">Middle</Button>
          <Button color="primary">Right</Button>
        </ButtonGroup>
      </div>
      <div className="my-3">
        <ButtonGroup className="my-2" size="lg">
          <Button outline color="primary">
            Left
          </Button>
          <Button outline color="primary">
            Middle
          </Button>
          <Button outline color="primary">
            Right
          </Button>
        </ButtonGroup>
        <br />
        <ButtonGroup className="my-2">
          <Button outline color="primary">
            Left
          </Button>
          <Button outline color="primary">
            Middle
          </Button>
          <Button outline color="primary">
            Right
          </Button>
        </ButtonGroup>
        <br />
        <ButtonGroup className="my-2" size="sm">
          <Button outline color="primary">
            Left
          </Button>
          <Button outline color="primary">
            Middle
          </Button>
          <Button outline color="primary">
            Right
          </Button>
        </ButtonGroup>
      </div>
    </>
  ),
};
