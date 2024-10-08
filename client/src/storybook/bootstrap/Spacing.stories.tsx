import cx from "classnames";
import { Meta, StoryObj } from "@storybook/react";

export default {
  args: {},
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
  title: "Bootstrap/GENERIC - Spacing",
} as Meta;

type Story = StoryObj<React.HTMLAttributes<HTMLDivElement>>;

export const DefaultSpacing: Story = {
  render: (_args) => (
    <div {..._args} className={cx("d-flex", "flex-column", "gap-3")}>
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
};

export const ReducedSpacing: Story = {
  render: (_args) => (
    <div {..._args} className={cx("d-flex", "flex-column", "gap-3")}>
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
};
