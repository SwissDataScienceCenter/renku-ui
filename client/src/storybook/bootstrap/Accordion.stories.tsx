import { Meta, StoryObj } from "@storybook/react";
import {
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Card,
  CardBody,
  CardHeader,
  UncontrolledAccordion,
} from "reactstrap";

export default {
  args: {
    flush: false,
    stayOpen: false,
  },
  argTypes: {
    flush: {
      control: "boolean",
      description:
        "Removes borders to render edge-to-edge with their parent container. Useful when used inside cards",
    },
    stayOpen: {
      control: "boolean",
      description:
        "Whether opening another element leaves the other open or not",
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

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  stayOpen: boolean;
  flush: boolean;
}
type Story = StoryObj<AccordionProps>;

export const Accordion_: Story = {
  render: ({ ...args }) => (
    <UncontrolledAccordion {...args} toggle={() => {}}>
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
    </UncontrolledAccordion>
  ),
};

export const FlushAccordion: Story = {
  parameters: {
    docs: {
      description: {
        story: "Useful inside cards or other bordered containers.",
      },
    },
  },
  render: () => (
    <Card>
      <CardHeader>
        <h5>A card</h5>
      </CardHeader>
      <CardBody>
        <UncontrolledAccordion flush toggle={() => {}}>
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
        </UncontrolledAccordion>
      </CardBody>
    </Card>
  ),
};
