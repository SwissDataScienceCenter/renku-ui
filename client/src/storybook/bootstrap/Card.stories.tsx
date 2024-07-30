import { Meta, StoryObj } from "@storybook/react";
import { Card, CardBody, CardFooter, CardHeader } from "reactstrap";
import React from "react";

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
  title: "Bootstrap/Card",
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
