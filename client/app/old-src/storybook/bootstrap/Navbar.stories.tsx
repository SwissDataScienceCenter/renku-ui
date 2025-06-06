import cx from "classnames";
import { Nav, NavItem, NavLink } from "reactstrap";
import { Eye, Sliders } from "react-bootstrap-icons";
import { Meta, StoryObj } from "@storybook/react";

const componentDescription = `
Navbar helps users navigate the application. We have a main navbar at the top and bottom of the application, and local navbar in pages (or rarely modals) requiring navigation.

This is an example taken from the project page used for local navigation. You can check another example in the Help page.

Mind that, for Renku v2 pages, you will probably need to use the RenkuNavLinkV2 component instead of the standard NavLink.
`;

export default {
  args: {
    active: "overview",
  },
  argTypes: {
    active: {
      type: {
        name: "enum",
        value: ["none", "overview", "settings"],
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
  title: "Bootstrap/Navbar",
} as Meta;

interface CardProps extends React.HtmlHTMLAttributes<HTMLElement> {
  active: string;
}

type Story = StoryObj<CardProps>;
Eye.displayName = "Eye";
Sliders.displayName = "Sliders";
export const Navbar_: Story = {
  render: ({ active }) => (
    <>
      <Nav tabs>
        <NavItem>
          <NavLink active={active === "overview"} to="#" title="Overview">
            <Eye className={cx("bi", "me-1")} />
            Overview
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            active={active === "settings"}
            to="#settings"
            title="Settings"
          >
            <Sliders className={cx("bi", "me-1")} />
            Settings
          </NavLink>
        </NavItem>
      </Nav>
    </>
  ),
};
