import { StoryObj } from "@storybook/react";

export default {
  title: "Bootstrap/Card OUTDATED",
  component: "div" as React.ElementType,
};

type Story = StoryObj<React.HTMLAttributes<HTMLDivElement>>;

export const BasicCard: Story = {
  args: {
    className: "card",
    children: (
      <>
        <div className="card-header">Header</div>
        <div className="card-body">
          <h5 className="card-title">Card title</h5>
          <p className="card-text">
            Some quick example text to build on the card title and make up the
            bulk of the cards content.
          </p>
        </div>
      </>
    ),
  },
};

export const CardWithImage: Story = {
  args: {
    className: "card",
    children: (
      <>
        <img
          src="https://via.placeholder.com/150"
          className="card-img-top"
          alt="..."
        />
        <div className="card-body">
          <h5 className="card-title">Card title</h5>
          <p className="card-text">
            Some quick example text to build on the card title and make up the
            bulk of the cards content.
          </p>
        </div>
      </>
    ),
  },
};
