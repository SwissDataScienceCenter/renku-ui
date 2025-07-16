import { Card, CardBody, CardFooter, CardHeader } from "reactstrap";
import { Meta, StoryObj } from "@storybook/react";

const componentDescription = `
This is a very generic example of card, rarely used in its vanilla version in Renku.

Mind that we customized the card component removing most of borders. Please check the "Card containing a List" story for a more common use case.

Feel free to implement your own card component if needed; mind that you might need to manually add borders/spacing to replicate the look and feel of the other Renku elements.
`;

export default {
  args: {
    headerText: "Card header - usually short",
    bodyText:
      "Card body - usually rather verbose. The content can literally be anything, usually not just text.",
    footerText: "Card footer - usually buttons or links, not text",
  },
  argTypes: {
    headerText: {
      type: {
        name: "string",
      },
    },
    bodyText: {
      type: {
        name: "string",
      },
    },
    footerText: {
      type: {
        name: "string",
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
  title: "Bootstrap/Card/Card",
} as Meta;

interface CardProps extends React.HtmlHTMLAttributes<HTMLElement> {
  headerText: string;
  bodyText: string;
  footerText: string;
}

type Story = StoryObj<CardProps>;
export const BasicCard_: Story = {
  render: ({ headerText, bodyText, footerText }) => (
    <Card>
      <CardHeader>
        <h5 className="mb-0">{headerText}</h5>
      </CardHeader>
      <CardBody>
        <p>{bodyText}</p>
        <p className="mb-0">Some static content you cannot change.</p>
      </CardBody>
      <CardFooter>{footerText}</CardFooter>
    </Card>
  ),
};
