import { Meta, StoryObj } from "@storybook/react-vite";
import cx from "classnames";

import EntityIcon, { type EntityIconType } from "./EntityIcon";

const ENTITY_TYPES: EntityIconType[] = [
  "project",
  "group",
  "user",
  "dataConnector",
];

const componentDescription = `
A labeled icon for a Renku entity.

Below Bootstrap \`md\` (768px) every type renders as a horizontal chip. From \`md\` up, projects and data connectors become a bordered card, and groups and users become a round badge with the label pill overlapping its lower edge.

The \`user\` variant uses \`UserAvatar\` for initials and color.
`;

interface EntityIconStoryProps {
  type: EntityIconType;
  namespace: string;
}

function SingleEntityIcon({ type, namespace }: EntityIconStoryProps) {
  return type === "user" ? (
    <EntityIcon type="user" namespace={namespace} />
  ) : (
    <EntityIcon type={type} />
  );
}

export default {
  title: "Atoms/Entity Icon",
  component: SingleEntityIcon,
  args: {
    type: "project",
    namespace: "research-user",
  },
  argTypes: {
    type: {
      control: { type: "select" },
      options: ENTITY_TYPES,
      description: "The kind of entity the icon represents.",
    },
    namespace: {
      control: "text",
      description:
        "Namespace slug, used only when type is 'user'. The initials and color come from UserAvatar.",
    },
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: componentDescription,
      },
    },
  },
} as Meta<EntityIconStoryProps>;

type Story = StoryObj<EntityIconStoryProps>;

export const Default: Story = {};

export const AllTypes: Story = {
  render: ({ namespace }) => (
    <div className={cx("align-items-start", "d-flex", "flex-wrap", "gap-4")}>
      {ENTITY_TYPES.map((type) => (
        <SingleEntityIcon key={type} type={type} namespace={namespace} />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "The four entity types.",
      },
    },
  },
};
