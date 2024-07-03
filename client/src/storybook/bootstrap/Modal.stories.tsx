import { StoryObj } from "@storybook/react";

export default {
  title: "Bootstrap/Modal OUTDATED",
  component: "div" as React.ElementType,
};

type Story = StoryObj<React.HTMLAttributes<HTMLDivElement>>;

export const BasicModal: Story = {
  args: {
    className: "modal show",
    style: { display: "block" },
    children: (
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Modal title</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <p>Modal body text goes here.</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Close
            </button>
            <button type="button" className="btn btn-primary">
              Save changes
            </button>
          </div>
        </div>
      </div>
    ),
  },
};
