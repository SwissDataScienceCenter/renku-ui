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
      description: "Color scheme to apply to the badge.",
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
      description: "Content to display inside the badge.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Badge is used to display small bits of information, such as notifications, status indicators, or counts. In Renku we mainly use it for showing the number of a specific type of entity available in a specific context (E.G. 4 data sources in a specific project)." +
          " Mind that we use the Info Badge variation of the simple Badge component whenever we need to show the status of a Renku entity. That includes semantic color, icons and spinners.",
      },
    },
  },
  title: "Bootstrap/Badge",
} as Meta;

type Story = StoryObj<React.HTMLAttributes<HTMLDivElement>>;

export const OnlyText_: Story = {
  parameters: {
    docs: {
      description: {
        story: "This is the simplest badge, including only text.",
      },
    },
  },
  render: (_args) => <Badge {..._args}>{_args.children}</Badge>,
};

export const BadgeSizes_: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The badge size adjust automatically to the text size. Mind that vertical alignment might need to be adjusted with the flex classes depending on where the badge is used.",
      },
    },
  },
  render: (_args) => (
    <>
      <h1>
        Example Heading h1 <Badge {..._args}>{_args.children}</Badge>
      </h1>
      <h2>
        Example Heading h2 <Badge {..._args}>{_args.children}</Badge>
      </h2>
      <h3>
        Example Heading h3 <Badge {..._args}>{_args.children}</Badge>
      </h3>
      <h4>
        Example Heading h4 <Badge {..._args}>{_args.children}</Badge>
      </h4>
      <h5>
        Example Heading h5 <Badge {..._args}>{_args.children}</Badge>
      </h5>
      <h6>
        Example Heading h6 <Badge {..._args}>{_args.children}</Badge>
      </h6>
      <p>
        Example Paragraph <Badge {..._args}>{_args.children}</Badge>
      </p>
    </>
  ),
};
