import { Meta, StoryObj } from "@storybook/react-vite";

import { EntityBreadcrumbView } from "~/components/entityBreadcrumb/EntityBreadcrumb";
import {
  buildDataConnectorBreadcrumbLevels,
  buildProjectBreadcrumbLevels,
} from "~/components/entityBreadcrumb/entityBreadcrumb.utils";
import { getDataConnectorIdentifier } from "~/features/dataConnectorsV2/components/dataConnector.utils";

export default {
  parameters: {
    docs: {
      description: {
        component:
          "Breadcrumb for project and data-connector pages. Linked levels underline on hover. The last level is the entity slug with a copy button.",
      },
    },
  },
  title: "Bootstrap/Entity Breadcrumb",
} as Meta;

type Story = StoryObj;

export const UserOwnedProject: Story = {
  parameters: {
    docs: {
      description: {
        story: "User-owned project: namespace and project slug.",
      },
    },
  },
  render: () => (
    <EntityBreadcrumbView
      clipboardText="user1-uuid/my-project"
      isReady
      levels={buildProjectBreadcrumbLevels({
        namespace: "user1-uuid",
        namespaceKind: "user",
        namespaceName: "User One",
        slug: "my-project",
      })}
    />
  ),
};

export const GroupOwnedProject: Story = {
  parameters: {
    docs: {
      description: {
        story: "Group-owned project: group and project slug.",
      },
    },
  },
  render: () => (
    <EntityBreadcrumbView
      clipboardText="test-2-group-v2/my-project"
      isReady
      levels={buildProjectBreadcrumbLevels({
        namespace: "test-2-group-v2",
        namespaceKind: "group",
        namespaceName: "Example Group",
        slug: "my-project",
      })}
    />
  ),
};

export const ProjectOwnedDataConnector: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Project-owned data connector: namespace, project name, and connector slug.",
      },
    },
  },
  render: () => (
    <EntityBreadcrumbView
      clipboardText={getDataConnectorIdentifier({
        namespace: "user1-uuid/my-project",
        slug: "project-storage",
      })}
      isReady
      levels={buildDataConnectorBreadcrumbLevels({
        namespace: "user1-uuid/my-project",
        namespaceKind: "user",
        namespaceName: "User One",
        projectName: "My Project",
        slug: "project-storage",
      })}
    />
  ),
};

export const LongNames: Story = {
  parameters: {
    docs: {
      description: {
        story: "Long project and connector names truncate on small screens.",
      },
    },
  },
  render: () => (
    <EntityBreadcrumbView
      clipboardText={getDataConnectorIdentifier({
        namespace: "user1-uuid/my-project",
        slug: "a-very-long-data-connector-slug-that-also-truncates",
      })}
      isReady
      levels={buildDataConnectorBreadcrumbLevels({
        namespace: "user1-uuid/my-project",
        namespaceKind: "user",
        namespaceName: "User One",
        projectName:
          "A very long project name that should truncate on small screens",
        slug: "a-very-long-data-connector-slug-that-also-truncates",
      })}
    />
  ),
};

export const ZenodoDataConnector: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Global data connector whose source is a Zenodo DOI host. The source label links to the DOI.",
      },
    },
  },
  render: () => (
    <EntityBreadcrumbView
      clipboardText={getDataConnectorIdentifier({
        slug: "doi-10.5281-zenodo.13896309",
      })}
      isReady
      levels={buildDataConnectorBreadcrumbLevels({
        slug: "doi-10.5281-zenodo.13896309",
        source: "zenodo.org",
        sourceUrl: "https://doi.org/10.5281/zenodo.13896309",
      })}
    />
  ),
};

export const Loading: Story = {
  parameters: {
    docs: {
      description: {
        story: "Shown while namespace, project, or DOI source data is loading.",
      },
    },
  },
  render: () => (
    <EntityBreadcrumbView clipboardText="" isReady={false} levels={[]} />
  ),
};
