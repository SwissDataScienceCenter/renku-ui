import cx from "classnames";
import {
  Card,
  CardBody,
  CardHeader,
  ListGroup,
  ListGroupItem,
} from "reactstrap";
import { PlayCircle } from "react-bootstrap-icons";
import { Meta, StoryObj } from "@storybook/react";

const componentDescription = `
Renku has in many places cards containing a list of elements that users can interact with. This is a simple example where the only interaction is a click.

You can check the Dashboard for a more complex example of a card with a list of elements having multiple interactions through a dropdown button.
`;

export default {
  args: {
    sessions: 2,
  },
  argTypes: {
    sessions: {
      type: {
        name: "number",
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
  title: "Bootstrap/Card/Card With List",
} as Meta;

interface CardProps extends React.HtmlHTMLAttributes<HTMLElement> {
  sessions: number;
}

type Story = StoryObj<CardProps>;
PlayCircle.displayName = "PlayCircle";
export const CardWithList_: Story = {
  render: ({ sessions }) => (
    <Card>
      <CardHeader>
        <h4 className="m-0">
          <PlayCircle className={cx("bi", "me-1")} />
          Sessions
        </h4>
      </CardHeader>
      <CardBody>
        <ListGroup flush>
          {[...Array(sessions)].map((_, index) => (
            <ListGroupItem
              className={cx("cursor-pointer", "list-group-item-action")}
              key={index}
            >
              Session {index + 1}
            </ListGroupItem>
          ))}
        </ListGroup>
      </CardBody>
    </Card>
  ),
};
