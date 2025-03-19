import cx from "classnames";
import { ListGroup, ListGroupItem } from "reactstrap";
import { PlayCircle } from "react-bootstrap-icons";
import { Meta, StoryObj } from "@storybook/react";

const componentDescription = `
Renku extensively uses List groups.

This example is very generic; for the most common variation (flush list group in a container), please check out the "Card containing a List" story.
`;

export default {
  args: {
    clickable: false,
    elements: 4,
    flush: false,
  },
  argTypes: {
    clickable: {
      type: {
        name: "boolean",
      },
    },
    elements: {
      type: {
        name: "number",
      },
    },
    flush: {
      type: {
        name: "boolean",
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
  title: "Bootstrap/List group",
} as Meta;

interface CardProps extends React.HtmlHTMLAttributes<HTMLElement> {
  clickable: boolean;
  elements: number;
  flush: boolean;
}

type Story = StoryObj<CardProps>;
PlayCircle.displayName = "PlayCircle";
export const ListGroup_: Story = {
  render: ({ clickable, elements, flush }) => (
    <>
      <ListGroup flush={flush}>
        {[...Array(elements)].map((_, index) => (
          <ListGroupItem
            className={cx(
              clickable ? ["cursor-pointer", "list-group-item-action"] : ""
            )}
            key={index}
          >
            Session {index + 1}
          </ListGroupItem>
        ))}
      </ListGroup>
    </>
  ),
};
