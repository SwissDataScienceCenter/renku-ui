import cx from "classnames";
import { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button, Offcanvas, OffcanvasBody } from "reactstrap";

const componentDescription = `
Offcanvas are used to show verbose details about specific entities. Compared to modals, it doesn't require user interactions.

In general, prefer an Offcanvas when no action is expected. Use a modal instead if you need user inputs or confirmations.

You can check the Project page for examples of Offcanvas in Renku. Clicking on any entity (session, data source, code repository) will open an Offcanvas with detailed information.
`;

export default {
  args: {
    backdrop: true,
  },
  argTypes: {
    backdrop: {
      description: "Obscure the content outside the offcanvas.",
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
  title: "Bootstrap/Offcanvas",
} as Meta;

type Story = StoryObj<React.HTMLAttributes<HTMLDivElement>>;

export const Offcanvas_: Story = {
  render: function OffcanvasStory(_args) {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);

    return (
      <>
        <Button color="primary" onClick={toggle}>
          Open offcanvas
        </Button>
        <Offcanvas direction="end" isOpen={isOpen} toggle={toggle} {..._args}>
          <OffcanvasBody>
            <div className={cx("d-flex", "flex-column", "gap-3")}>
              <button
                aria-label="Close"
                className="btn-close"
                data-bs-dismiss="offcanvas"
                onClick={toggle}
              ></button>

              <h2 className="m-0">Session detail</h2>

              <div>
                <h4>Session data</h4>
                <p>Prop 1</p>
                <p>Prop 2</p>
                <p className="m-0">Prop 3</p>
              </div>

              <div>
                <h4>Session data</h4>
                <p>Prop 1</p>
                <p>Prop 2</p>
                <p className="m-0">Prop 3</p>
              </div>
            </div>
          </OffcanvasBody>
        </Offcanvas>
      </>
    );
  },
};
