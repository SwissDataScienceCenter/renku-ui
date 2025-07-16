import { Placement } from "@popperjs/core";
import { Meta, StoryObj } from "@storybook/react";
import { useRef } from "react";
import { FileEarmarkText } from "react-bootstrap-icons";
import { Button, UncontrolledTooltip } from "reactstrap";

const componentDescription = `
A Tooltip gives additional info without taking space on the page. It shows when the user hovers on an element.

It is a great way to provide more context when users might be confused. Think about a single button without text, or a disabled button caused by invalid inputs that might not be visible on the page.

If you need to provide more complex information, consider using a popover instead. The mechanism is similar but it allows for complex content and different types of interactions (E.G. clicking on the element to keep it open, or to open it in the first place).
`;

export default {
  args: {
    placement: "top",
  },
  argTypes: {
    placement: {
      description: "Tooltip placement, given there is enough space.",
      type: {
        name: "enum",
        value: ["top", "bottom", "left", "right"],
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
  title: "Bootstrap/Tooltip",
} as Meta;

interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  placement: string;
}
type Story = StoryObj<TooltipProps>;

FileEarmarkText.displayName = "FileEarmarkText";
export const TooltipIcon_: Story = {
  render: function TooltipStory({ placement }) {
    const ref = useRef<HTMLButtonElement>(null);

    return (
      <>
        <div className="p-5">
          <Button color="primary" innerRef={ref}>
            <FileEarmarkText className="bi" />
          </Button>
          <UncontrolledTooltip target={ref} placement={placement as Placement}>
            Get logs
          </UncontrolledTooltip>
        </div>
      </>
    );
  },
};

export const TooltipDisabled_: Story = {
  render: function TooltipStory({ placement }) {
    const ref = useRef<HTMLDivElement>(null);

    return (
      <>
        <div className="p-5">
          <div className="d-inline-block" ref={ref} tabIndex={0}>
            <Button color="primary" disabled={true}>
              Create project
            </Button>
          </div>
          <UncontrolledTooltip placement={placement as Placement} target={ref}>
            Fix the namespace to create a project.
          </UncontrolledTooltip>
        </div>
      </>
    );
  },
};
