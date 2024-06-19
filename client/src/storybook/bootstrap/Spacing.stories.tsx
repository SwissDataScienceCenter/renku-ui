import cx from "classnames";
import { StoryObj } from "@storybook/react";

export default {
  title: "Bootstrap/Spacing OUTDATED",
  component: "div" as React.ElementType,
  parameters: {
    docs: {
      description: {
        component:
          "Bootstrap spacing utility classes are used to add margin or padding to an element. " +
          "We should stick to these classes to maintain consistency with spacing in the UI." +
          "By default, most components have a spacing of `3`. We should try to stick to that as" +
          "much as possible. If you need to remove the spacing (E.G. the last paragraph) use 0." +
          "Wherever makes sense you can reduce to 2 or raise it to 4",
      },
    },
  },
};

type Story = StoryObj<React.HTMLAttributes<HTMLDivElement>>;

export const DefaultSpacing: Story = {
  args: {
    children: (
      <div className={cx("d-flex", "flex-column", "gap-3")}>
        <div className="card">
          <div className="card-body">Card body</div>
        </div>
        <div className="card">
          <div className="card-body">Card body</div>
        </div>
        <div className="card">
          <div className="card-body">
            <p>My first paragraph.</p>
            <p className="m-0">My second paragraph.</p>
          </div>
        </div>
      </div>
    ),
  },
};

export const ReducedSpacing: Story = {
  args: {
    children: (
      <div className={cx("d-flex", "flex-column", "gap-3")}>
        <div className="card">
          <div className="card-body">Card body</div>
        </div>
        <div className="card">
          <div className="card-body">Card body</div>
        </div>
        <div className="card">
          <div className="card-body">
            <h4>A list of items</h4>
            <div className={cx("d-flex", "flex-column", "gap-2")}>
              <div className="card">
                <div className="card-body">Sub-card 1</div>
              </div>
              <div className="card">
                <div className="card-body">Sub-card 2</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
};
