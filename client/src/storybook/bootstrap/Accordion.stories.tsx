import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
} from "reactstrap";

export default {
  args: {
    flush: false,
  },
  argTypes: {
    flush: {
      control: "boolean",
      description:
        "Removes the default background color, some borders, and rounded corners to render accordions edge-to-edge with their parent container.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Accordion is a set of expandable panels stacked vertically, perfect for saving space and toggling content visibility.",
      },
    },
  },
  title: "Bootstrap/Accordion",
} as Meta;

type Story = StoryObj<React.HTMLAttributes<HTMLDivElement>>;

interface AccordionProps {
  open?: string;
  flush?: boolean;
}
const AccordionTemplate: React.FC<AccordionProps> = (props) => {
  const [open, setOpen] = useState(props.open ?? "");
  const toggle = (id: string) => {
    if (open === id) {
      setOpen("");
    } else {
      setOpen(id);
    }
  };

  return (
    <Accordion open={open} toggle={toggle} flush={props.flush}>
      <AccordionItem>
        <AccordionHeader targetId="1">Accordion Item 1</AccordionHeader>
        <AccordionBody accordionId="1">
          Content for the first accordion item.
        </AccordionBody>
      </AccordionItem>
      <AccordionItem>
        <AccordionHeader targetId="2">Accordion Item 2</AccordionHeader>
        <AccordionBody accordionId="2">
          Content for the second accordion item.
        </AccordionBody>
      </AccordionItem>
      <AccordionItem>
        <AccordionHeader targetId="3">Accordion Item 3</AccordionHeader>
        <AccordionBody accordionId="3">
          Content for the third accordion item.
        </AccordionBody>
      </AccordionItem>
    </Accordion>
  );
};

const SourceCode = (flush: boolean, open?: string) => `
import React, { useState } from "react";
import { Accordion, AccordionBody, AccordionHeader, AccordionItem } from "reactstrap";

const Example = (props) => {
  const [open, setOpen] = useState(${open ?? ""});
  const toggle = (id: string) => {
    if (open === id) {
      setOpen('');
    } else {
      setOpen(id);
    }
  };

  return (
    <Accordion open={open} toggle={toggle} flush={${flush}}>
      <AccordionItem>
        <AccordionHeader targetId="1">Accordion Item 1</AccordionHeader>
        <AccordionBody accordionId="1">
          Content for the first accordion item.
        </AccordionBody>
      </AccordionItem>
      <AccordionItem>
        <AccordionHeader targetId="2">Accordion Item 2</AccordionHeader>
        <AccordionBody accordionId="2">
          Content for the second accordion item.
        </AccordionBody>
      </AccordionItem>
      <AccordionItem>
        <AccordionHeader targetId="3">Accordion Item 3</AccordionHeader>
        <AccordionBody accordionId="3">
          Content for the third accordion item.
        </AccordionBody>
      </AccordionItem>
    </Accordion>
  );
};
`;

export const BasicAccordion: Story = {
  render: (args) => <AccordionTemplate {...args} />,
  parameters: {
    docs: {
      source: {
        code: SourceCode(false),
      },
    },
  },
};

export const FlushAccordion: Story = {
  render: (args) => <AccordionTemplate {...args} flush={true} />,
  parameters: {
    docs: {
      source: {
        code: SourceCode(true),
      },
    },
  },
};

export const AlwaysOpen: Story = {
  render: (args) => <AccordionTemplate {...args} open="1" />,
  parameters: {
    docs: {
      source: {
        code: SourceCode(false, "1"),
      },
    },
  },
};
