import { Meta, StoryObj } from "@storybook/react";
import { Badge } from "reactstrap";

export default {
  args: {
    color: "primary",
    pill: false,
    children: "Simple text",
  },
  argTypes: {
    color: {
      description: "Color scheme to apply to the button.",
      type: {
        name: "enum",
        value: ["primary", "secondary", "success", "info", "warning", "danger"],
      },
    },
    pill: {
      description:
        "Use the pill prop to make badges more rounded with a larger border-radius.",
      type: {
        name: "boolean",
      },
    },
    children: {
      description: "",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Badge is used to display small bits of information, such as notifications, status indicators, or counts. In Renku, for example, it is commonly used to display session status. Depending on the status, we use warning, danger, or success colors.",
      },
    },
  },
  title: "Bootstrap/Badge",
} as Meta;

type Story = StoryObj<React.HTMLAttributes<HTMLDivElement>>;

export const OnlyText_: Story = {
  render: (_args) => <Badge {..._args}>{_args.children}</Badge>,
};

export const BadgeSizes_: Story = {
  render: () => (
    <>
      <h1>
        Example Heading h1 <Badge>New</Badge>
      </h1>
      <h2>
        Example Heading h2 <Badge>New</Badge>
      </h2>
      <h3>
        Example Heading h3 <Badge>New</Badge>
      </h3>
      <h4>
        Example Heading h4 <Badge>New</Badge>
      </h4>
      <h5>
        Example Heading h5 <Badge>New</Badge>
      </h5>
      <h6>
        Example Heading h6 <Badge>New</Badge>
      </h6>
      <p>
        Example Paragraph <Badge>New</Badge>
      </p>
    </>
  ),
};
