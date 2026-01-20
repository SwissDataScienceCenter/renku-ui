import { Controls } from "@storybook/addon-docs";
import { Canvas, Unstyled } from "@storybook/blocks";
import { Meta, StoryObj } from "@storybook/react";
import cx from "classnames";
import { ReactNode } from "react";
import {
  CheckCircleFill,
  Folder,
  People,
  PlayCircle,
  PlusLg,
  ThreeDotsVertical,
  XCircleFill,
} from "react-bootstrap-icons";
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ListGroup,
  ListGroupItem,
} from "reactstrap";

interface ContainerSectionCardProps {
  title: string;
  icon: "folder" | "play-circle" | "people";
  action?: "add" | "three-dots-vertical" | "none";
  badgeValue: number;
  children: ReactNode | string;
  description?: string;
}

const contentOptions = {
  Text: "This is an example of the content within the card body. It provides more detailed information about the section and what users can expect to find here.",
  Lists: (
    <ListGroup flush>
      <ListGroupItem
        className={cx("cursor-pointer", "list-group-item-action")}
        key={"list-1"}
      >
        Session 1
      </ListGroupItem>
      <ListGroupItem
        className={cx("cursor-pointer", "list-group-item-action")}
        key={"list-1"}
      >
        Session 2
      </ListGroupItem>
      <ListGroupItem
        className={cx("cursor-pointer", "list-group-item-action")}
        key={"list-1"}
      >
        Session 3
      </ListGroupItem>
    </ListGroup>
  ),
};

function SectionCardDocsPage() {
  return (
    <div className={cx("p-4", "mx-auto")} style={{ maxWidth: "900px" }}>
      <h1
        className={cx(
          "fs-2",
          "fw-bold",
          "mb-4",
          "border-bottom",
          "border-2",
          "border-primary",
          "pb-2",
          "text-primary"
        )}
      >
        Container Section Card
      </h1>

      <section className="mb-5">
        <p className={cx("fs-6", "text-muted", "mb-4")}>
          The <b>Container Section Card</b> is a reusable component used
          throughout the Renku UI to group content visually. It is composed of a
          header (with optional icons, buttons, or badges) and a body area for
          structured content. This card brings visual consistency to dashboards,
          summaries, and complex content blocks.
        </p>
      </section>

      <section className="mb-5">
        <h2
          className={cx(
            "font-sans",
            "fw-bold",
            "fs-5",
            "mb-3",
            "border-bottom",
            "border-2",
            "border-primary",
            "pb-2",
            "text-primary"
          )}
        >
          When to use it
        </h2>
        <p className={cx("fs-6", "text-muted", "mb-4")}>
          Use the Section Container Card to visually group related content
          within a page. It&apos;s ideal for structuring forms, settings, or
          dashboard sections where a clear separation between different content
          blocks enhances readability and organization.
        </p>
      </section>

      <section className="mb-5">
        <h2
          className={cx(
            "font-sans",
            "fw-bold",
            "fs-5",
            "mb-3",
            "border-bottom",
            "border-2",
            "border-primary",
            "pb-2",
            "text-primary"
          )}
        >
          Anatomy
        </h2>
        <ul className={cx("list-unstyled", "ms-3", "mb-4")}>
          <li>
            <strong>
              Container (<code>&lt;Card&gt;</code>)
            </strong>
          </li>
          <li>
            <strong>
              Header (<code>&lt;CardHeader&gt;</code>)
            </strong>
            <ul className={cx("list-unstyled", "ms-4")}>
              <li>Title with an Icon</li>
              <li>Optional badge</li>
              <li>Optional button with only icon</li>
            </ul>
          </li>
          <li>
            <strong>
              Body (<code>&lt;CardBody&gt;</code>)
            </strong>
            <ul className={cx("list-unstyled", "ms-4")}>
              <li>
                Custom content (list as My projects Section, forms as General
                Settings section, other cards as Sessions Section or any other
                components or info as Documentation Section.)
              </li>
            </ul>
          </li>
        </ul>
      </section>

      <section className="mb-5">
        <h2
          className={cx(
            "font-sans",
            "fw-bold",
            "fs-5",
            "mb-3",
            "border-bottom",
            "border-2",
            "border-primary",
            "pb-2",
            "text-primary"
          )}
        >
          Interactive Component
        </h2>
        <p className={cx("fs-6", "text-muted", "mb-4")}>
          Use the controls below to interact with the Container Section Card and
          see how different props affect its appearance.
        </p>
        <div
          className={cx(
            "d-flex",
            "flex-column",
            "justify-content-center",
            "align-items-center",
            "p-4",
            "bg-light",
            "border",
            "rounded",
            "min-vh-25",
            "w-100"
          )}
        >
          <Unstyled>
            <Canvas of={BasicCard_} />
          </Unstyled>
          <Controls of={BasicCard_} />
        </div>
      </section>

      <section className="mb-5">
        <h2
          className={cx(
            "font-sans",
            "fw-bold",
            "fs-5",
            "mb-3",
            "border-bottom",
            "border-2",
            "border-primary",
            "pb-2",
            "text-primary"
          )}
        >
          Usage Guidelines
        </h2>

        <h3 className={cx("fs-6", "fw-semibold", "mt-4", "mb-2")}>
          <CheckCircleFill className={cx("me-2", "text-success")} /> Do&apos;s
        </h3>
        <ul className={cx("list-styled", "ms-3", "mb-4")}>
          <li>Use Bootstrap utility classes for spacing and sizing</li>
          <li>Keep header structure consistent across all cards</li>
          <li>
            Use **only** the <code>primary-outline</code> button in the card
            header
          </li>
        </ul>

        <h3 className={cx("fs-6", "fw-semibold", "mt-4", "mb-2")}>
          <XCircleFill className={cx("me-2", "text-danger")} />
          Don&apos;ts{" "}
        </h3>
        <ul className={cx("list-unstyled", "ms-3", "mb-4")}>
          <li>
            Don’t place descriptions in the header — include them in the body
            instead
          </li>
          <li>Don’t hardcode custom spacing unless absolutely necessary</li>
          <li>Don’t mix multiple heading levels in the card title</li>
          <li>
            Don’t include other elements like images in the header — only
            predefined variations are allowed
          </li>
          <li>Don’t place more than one primary button on a card header</li>
          <li>
            Don’t overload the card with content — if it requires scrolling,
            split it into multiple cards or sections
          </li>
          <li>
            Don’t apply custom styles for state changes like focus or selected
          </li>
        </ul>
      </section>

      <section className="mb-5">
        <h2
          className={cx(
            "font-sans",
            "fw-bold",
            "fs-5",
            "mb-3",
            "border-bottom",
            "border-2",
            "border-primary",
            "pb-2",
            "text-primary"
          )}
        >
          Variants
        </h2>
        <ol className={cx("list-unstyled", "ms-3", "mb-4")}>
          <li className="mb-4">
            <h3 className={cx("fs-6", "fw-semibold")}>1. Basic With Icon</h3>
            <ul className={cx("list-unstyled", "ms-3", "mb-2")}>
              <li>Icon + title in header</li>
            </ul>
            <div
              className={cx(
                "justify-content-center",
                "align-items-center",
                "p-3",
                "bg-light",
                "border",
                "rounded"
              )}
            >
              <Canvas of={Basic} />
            </div>
          </li>
          <li className="mb-4">
            <h3 className={cx("fs-6", "fw-semibold")}>2. With Badged</h3>
            <ul className={cx("list-unstyled", "ms-3", "mb-2")}>
              <li>gray badge for counter in the header</li>
            </ul>
            <div
              className={cx(
                "justify-content-center",
                "align-items-center",
                "p-3",
                "bg-light",
                "border",
                "rounded"
              )}
            >
              <Canvas of={WithBadge} />
            </div>
          </li>
          <li className="mb-4">
            <h3 className={cx("fs-6", "fw-semibold")}>3. With Actions</h3>
            <ul className={cx("list-unstyled", "ms-3", "mb-2")}>
              <li>Right-aligned Icon button(s) in the header</li>
            </ul>
            <div
              className={cx(
                "justify-content-center",
                "align-items-center",
                "p-3",
                "bg-light",
                "border",
                "rounded",
                "flex-column",
                "gap-3",
                "w-100"
              )}
            >
              <Canvas of={WithAction} />
            </div>
          </li>
          <li className="mb-4">
            <h3 className={cx("fs-6", "fw-semibold")}>3. With Description</h3>
            <ul className={cx("list-unstyled", "ms-3", "mb-2")}>
              <li>
                When a section card includes a description, it is placed in the
                card body with the following styles:
              </li>
            </ul>
            <div
              className={cx(
                "justify-content-center",
                "align-items-center",
                "p-3",
                "bg-light",
                "border",
                "rounded",
                "flex-column",
                "gap-3",
                "w-100"
              )}
            >
              <Canvas of={WithDescription} />
            </div>
          </li>
        </ol>
      </section>
    </div>
  );
}

export default {
  title: "Molecules/Card/Container Section Card",
  args: {
    title: "Example Section",
    icon: "info-circle",
    action: "none",
    badgeValue: 0,
    children: "This is an example of the content within the card body.",
  },
  argTypes: {
    title: {
      control: "text",
      description: "Header title text",
    },
    icon: {
      control: { type: "select" },
      options: ["folder", "play-circle", "people"],
      description:
        "SVG icon, predefined options for testing purposes: 'folder', 'play-circle', 'people'.",
    },
    action: {
      control: { type: "select" },
      options: ["add", "three-dots-vertical", "none"],
      description:
        "Predefined options for testing purposes. Use 'none' to remove the button.",
    },
    badgeValue: {
      control: "number",
      description: "Value for the badge (if applicable). Set to -1 to hide.",
    },
    description: {
      control: "text",
      description: "Description text for the card body. ",
    },
    children: {
      control: { type: "select" },
      options: Object.keys(contentOptions),
      mapping: contentOptions,
      description: "Card content (ReactNode) - Select from predefined options",
      table: {
        type: { summary: "ReactNode" },
      },
    },
  },
  parameters: {
    layout: "centered",
    docs: {
      page: SectionCardDocsPage,
    },
  },
} as Meta;

type Story = StoryObj<ContainerSectionCardProps>;

export const BasicCard_: StoryObj<ContainerSectionCardProps> = {
  render: ({ title, icon, action, badgeValue, description, children }) => {
    const IconToRender = {
      folder: <Folder className="me-1" />,
      "play-circle": <PlayCircle className="me-1" />,
      people: <People className="me-1" />,
    };
    const buttonIcon =
      action === "none" ? null : action === "add" ? (
        <PlusLg />
      ) : (
        <ThreeDotsVertical />
      );

    return (
      <Card>
        <CardHeader>
          <div
            className={cx(
              "align-items-center",
              "d-flex",
              "justify-content-between"
            )}
          >
            <div className={cx("align-items-center", "d-flex")}>
              <h4 className={cx("mb-0", "me-2")}>
                {IconToRender[icon]}
                {title}
              </h4>
              {badgeValue >= 0 && <Badge>{badgeValue}</Badge>}
            </div>
            {buttonIcon && (
              <div className="my-auto">
                <Button
                  color="outline-primary"
                  size="sm"
                  className={cx("btn-sm")}
                >
                  {buttonIcon}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardBody>
          <p className={cx("text-body-secondary")}>{description}</p>
          {children}
        </CardBody>
      </Card>
    );
  },
  args: {
    title: "My Projects",
    icon: "folder",
    action: "add",
    description: "List of your recent projects will appear here.",
    children: contentOptions["Text"],
  },
  parameters: {
    docs: {
      source: {
        type: "auto",
        language: "tsx",
      },
    },
  },
};

export const Basic: Story = {
  render: BasicCard_.render,
  args: {
    title: "Groups",
    icon: "people",
    badgeValue: -1,
  },
};
export const WithBadge: Story = {
  render: BasicCard_.render,
  args: {
    title: "Sessions",
    icon: "play-circle",
    badgeValue: 5,
    children: "You have 5 unread notifications.",
  },
};

export const WithAction: Story = {
  render: BasicCard_.render,
  args: {
    title: "Groups",
    icon: "people",
    action: "three-dots-vertical",
    children: "You don't have groups yet",
    badgeValue: -1,
  },
};

export const WithDescription: Story = {
  render: BasicCard_.render,
  args: {
    title: "Groups",
    icon: "people",
    action: "three-dots-vertical",
    description: "Manage your groups from this section.",
    children: "",
  },
};
