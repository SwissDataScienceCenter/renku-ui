import { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  Button,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

const componentDescription = `
Modals are used to show complex dialog that require user interaction. They can be used to show information, ask for confirmation, or to perform more complex actions.
In general, prefer a modal when the interaction is optional in the specific context, and requires either a confirmation or more complex interactions.
`;

export default {
  args: {
    size: "lg",
  },
  argTypes: {
    size: {
      description: "Modal size.",
      type: {
        name: "enum",
        value: ["sm", "lg", "xl"],
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component: componentDescription,
      },
    },
  },
  title: "Bootstrap/Modal",
} as Meta;

type Story = StoryObj<React.HTMLAttributes<HTMLDivElement>>;

export const Modal_: Story = {
  render: function ModalStory(_args) {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);

    return (
      <>
        <Button color="primary" onClick={toggle}>
          Open modal
        </Button>
        <Modal isOpen={isOpen} toggle={toggle} {..._args}>
          <ModalHeader toggle={toggle}>Add a project member</ModalHeader>
          <ModalBody>
            <Label>Username</Label>
            <Input />
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={toggle}>
              Add
            </Button>
            <Button color="secondary" onClick={toggle}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};
