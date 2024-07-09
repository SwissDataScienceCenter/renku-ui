import { Meta, StoryObj } from "@storybook/react";
import { Card, CardBody, CardFooter, CardHeader } from "reactstrap";
import React from "react";

const BasicModalcontent = () => {
  return (
    <>
      <h5>Header</h5>
      <p>Lorem ipsum...</p>
    </>
  );
};

export default {
  args: {
    header: "Card header",
    children: <BasicModalcontent />,
    footer: "Footer card",
  },
  argTypes: {
    header: {
      description: "",
      type: {
        name: "string",
      },
    },
    title: {
      description: "",
      type: {
        name: "string",
      },
    },
    children: {
      description: "",
    },
    footer: {
      description: "",
    },
  },
  title: "Bootstrap/Card",
} as Meta;

// type Story = StoryObj<React.HTMLAttributes<HTMLDivElement>>;

// export const BasicCard: Story = {
//   args: {
//     className: "card",
//     children: (
//       <>
//         <div className="card-header">Header</div>
//         <div className="card-body">
//           <h5 className="card-title">Card title</h5>
//           <p className="card-text">
//             Some quick example text to build on the card title and make up the
//             bulk of the cards content.
//           </p>
//         </div>
//       </>
//     ),
//   },
// };

interface CardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  header: string;
  footer: string;
}
type Story = StoryObj<CardProps>;
export const BasicCard_: Story = {
  render: ({ header, children, footer }) => (
    <Card>
      <CardHeader>{header}</CardHeader>
      <CardBody>{children}</CardBody>
      <CardFooter>{footer}</CardFooter>
    </Card>
  ),
};

// export const CardWithImage: Story = {
//   args: {
//     className: "card",
//     children: (
//       <>
//         <img
//           src="https://via.placeholder.com/150"
//           className="card-img-top"
//           alt="..."
//         />
//         <div className="card-body">
//           <h5 className="card-title">Card title</h5>
//           <p className="card-text">
//             Some quick example text to build on the card title and make up the
//             bulk of the cards content.
//           </p>
//         </div>
//       </>
//     ),
//   },
// };
