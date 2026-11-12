import { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within } from "storybook/test";

import PrerequisitesWizard, {
  type PrerequisitesWizardProps,
} from "~/components/prerequisitesWizard/PrerequisitesWizard";
import {
  buildSteps,
  JOB_FIRST_STEP_STATES,
  JOB_STEP_IDS,
  JOB_WIZARD_CONFIG,
  RESOURCE_CLASS_REQUIRED_REASON,
  SESSION_ALL_RESOLVED_STATES,
  SESSION_MID_FLOW_STATES,
  SESSION_MID_FLOW_VISITED,
  SESSION_STEP_IDS,
  SESSION_WIZARD_CONFIG,
  StepPlaceholder,
  type StepId,
} from "./prerequisitesWizard.fixtures";

const componentDescription = `
A generic step-by-step modal for any flow where the user works through a list of steps before a final action.

The component knows nothing about what the steps configure. Everything is passed through props:

- \`title\`, \`summaryTitle\` and \`summaryDetails\` describe the flow and what it configures.
- \`steps\` holds each step's label, status counts and content.
- \`submitLabel\`, \`skipAllLabel\` and \`submitOutcome\` name the final action. \`skipAllLabel\` is optional.
- A step with \`isRequired\` blocks submit and skip-all until it is complete. Continue stays available. \`isSubmitDisabled\` and \`submitDisabledReason\` block the final action and skip-all for any other reason.

Steps can be done in any order. Each step is either a single item with a short status text, or a list of items with resolved and total counts. Every step passed in is shown, and the wizard opens on the first one. The parent decides which steps apply before passing them.

Below Bootstrap \`lg\` (992px) the modal is full screen: the step list moves into a collapsible "Steps" panel, and the footer stacks Cancel above Continue/Submit at full width.

**About these stories:** they mock Renku's two first use cases, submitting a job and launching a session. 
`;

export default {
  title: "Molecules/Prerequisites Wizard",
  component: PrerequisitesWizard,
  args: {
    isOpen: true,
    onCancel: fn(),
    onStepChange: fn(),
    onSubmit: fn(),
  },
  argTypes: {
    summaryDetails: { control: false },
    steps: { control: false },
  },
  parameters: {
    docs: {
      description: { component: componentDescription },
      story: { inline: false, iframeHeight: 760 },
    },
  },
} as Meta<typeof PrerequisitesWizard>;

type Story = StoryObj<typeof PrerequisitesWizard>;

const MOBILE_VIEWPORT = {
  globals: { viewport: { value: "mobile2", isRotated: false } }, // eslint-disable-line spellcheck/spell-checker
};

export const JobFirstStep: Story = {
  args: {
    ...JOB_WIZARD_CONFIG,
    steps: buildSteps(JOB_STEP_IDS, JOB_FIRST_STEP_STATES),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Review job is required and still open, so submit and skip-all stay disabled. The other steps are not visited yet.",
      },
    },
  },
};

export const SessionResourceClassRequired: Story = {
  args: {
    ...SESSION_WIZARD_CONFIG,
    isSubmitDisabled: true,
    steps: buildSteps(SESSION_STEP_IDS),
    submitDisabledReason: RESOURCE_CLASS_REQUIRED_REASON,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Launching stays blocked until a resource class is chosen. Continue and the step list stay usable.",
      },
    },
  },
};

export const SessionMidFlow: Story = {
  args: {
    ...SESSION_WIZARD_CONFIG,
    initialStepId: "sshKey",
    initialVisitedStepIds: SESSION_MID_FLOW_VISITED,
    steps: buildSteps(SESSION_STEP_IDS, SESSION_MID_FLOW_STATES),
  },
  parameters: {
    docs: {
      description: {
        story: "Done, in progress, current and not visited steps together.",
      },
    },
  },
};

export const AllResolved: Story = {
  args: {
    ...SESSION_WIZARD_CONFIG,
    initialStepId: "storageCredentials",
    initialVisitedStepIds: SESSION_STEP_IDS.slice(0, -1),
    steps: buildSteps(SESSION_STEP_IDS, SESSION_ALL_RESOLVED_STATES),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Every item is resolved and the last step is current, so the skip-all button is hidden.",
      },
    },
  },
};

export const FewerStepsJobReviewOnly: Story = {
  name: "Fewer steps: job with Review job only",
  args: {
    ...JOB_WIZARD_CONFIG,
    steps: buildSteps(["review"]),
  },
};

export const FewerStepsSessionTwoSteps: Story = {
  name: "Fewer steps: session with two steps",
  args: {
    ...SESSION_WIZARD_CONFIG,
    steps: buildSteps(["sshKey", "storageCredentials"]),
  },
};

export const OtherFlow: Story = {
  name: "Other flow: without summary or skip-all",
  args: {
    title: "Set up a new group",
    submitLabel: "Create group",
    steps: [
      {
        id: "details",
        label: "Group details",
        kind: "single",
        isRequired: true,
        isSatisfied: true,
        description: "Name the group and describe what it is for.",
        content: <StepPlaceholder label="Group details" />,
      },
      {
        id: "members",
        label: "Members",
        kind: "multi",
        resolved: 1,
        total: 4,
        description: "Invite the people who should have access.",
        content: <StepPlaceholder label="Members" />,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "A flow unrelated to jobs or sessions, to show that `summaryTitle`, `summaryDetails` and `skipAllLabel` are optional.",
      },
    },
  },
};

export const MobileStepsCollapsed: Story = {
  ...SessionMidFlow,
  ...MOBILE_VIEWPORT,
};

export const MobileStepsExpanded: Story = {
  ...SessionMidFlow,
  ...MOBILE_VIEWPORT,
  tags: ["!test"],
  play: async () => {
    const body = within(document.body);
    await userEvent.click(
      await body.findByRole("button", { name: /^Steps/, expanded: false }),
    );
  },
};

export const MobileSessionSecrets: Story = {
  args: {
    ...SESSION_WIZARD_CONFIG,
    initialStepId: "sessionSecrets",
    initialVisitedStepIds: [
      "resourceClass",
      "repositories",
      "expiredDataConnectors",
    ],
    steps: buildSteps(SESSION_STEP_IDS, {
      ...SESSION_MID_FLOW_STATES,
      sessionSecrets: { resolved: 1 },
    }),
  },
  ...MOBILE_VIEWPORT,
};

export const MobileJobFirstStep: Story = {
  ...JobFirstStep,
  ...MOBILE_VIEWPORT,
};

type SingleItemStepId = "review" | "resourceClass" | "sshKey";

interface PlaygroundArgs extends Pick<
  PrerequisitesWizardProps,
  | "isSubmitDisabled"
  | "isSubmitting"
  | "onCancel"
  | "onStepChange"
  | "onSubmit"
  | "submitDisabledReason"
> {
  flow: "job" | "session";
  currentStep: StepId;
  visitedSteps: StepId[];
  omittedSteps: StepId[];
  satisfiedSteps: SingleItemStepId[];
  repositoriesResolved: number;
  expiredDataConnectorsResolved: number;
  sessionSecretsResolved: number;
  storageCredentialsResolved: number;
}

function PlaygroundWizard({
  flow,
  currentStep,
  visitedSteps,
  omittedSteps,
  satisfiedSteps,
  repositoriesResolved,
  expiredDataConnectorsResolved,
  sessionSecretsResolved,
  storageCredentialsResolved,
  ...props
}: PlaygroundArgs) {
  const config = flow === "job" ? JOB_WIZARD_CONFIG : SESSION_WIZARD_CONFIG;
  const stepIds: StepId[] = (
    flow === "job" ? JOB_STEP_IDS : SESSION_STEP_IDS
  ).filter((id) => !omittedSteps.includes(id));
  const resolvedCounts: Partial<Record<StepId, number>> = {
    repositories: repositoriesResolved,
    expiredDataConnectors: expiredDataConnectorsResolved,
    sessionSecrets: sessionSecretsResolved,
    storageCredentials: storageCredentialsResolved,
  };
  const states = Object.fromEntries(
    stepIds.map((id) => [
      id,
      {
        isSatisfied: (satisfiedSteps as StepId[]).includes(id),
        resolved: resolvedCounts[id],
      },
    ]),
  );

  return (
    <PrerequisitesWizard
      {...config}
      {...props}
      initialStepId={currentStep}
      initialVisitedStepIds={visitedSteps}
      isOpen
      // Remounts so the initial step and visited set follow the controls.
      key={[flow, currentStep, ...visitedSteps].join("-")}
      steps={buildSteps(stepIds, states)}
    />
  );
}

const ALL_STEP_IDS: StepId[] = Array.from(
  new Set<StepId>([...JOB_STEP_IDS, ...SESSION_STEP_IDS]),
);

const resolvedCountControl = (max: number) => ({
  control: { type: "range" as const, min: 0, max, step: 1 },
});

export const Playground: StoryObj<PlaygroundArgs> = {
  render: (args) => <PlaygroundWizard {...args} />,
  args: {
    flow: "session",
    currentStep: "sshKey",
    visitedSteps: SESSION_MID_FLOW_VISITED,
    omittedSteps: [],
    satisfiedSteps: ["resourceClass"],
    repositoriesResolved: 3,
    expiredDataConnectorsResolved: 1,
    sessionSecretsResolved: 0,
    storageCredentialsResolved: 0,
    isSubmitDisabled: false,
    isSubmitting: false,
    submitDisabledReason: RESOURCE_CLASS_REQUIRED_REASON,
  },
  argTypes: {
    flow: { control: "inline-radio", options: ["job", "session"] },
    currentStep: {
      control: "select",
      description:
        "Initial step. Falls back to the first step when it is not in the list.",
      options: ALL_STEP_IDS,
    },
    visitedSteps: { control: "check", options: ALL_STEP_IDS },
    omittedSteps: {
      control: "check",
      description: "Steps the parent does not pass.",
      options: ALL_STEP_IDS,
    },
    satisfiedSteps: {
      control: "check",
      description: "Single-item steps that are satisfied.",
      options: ["review", "resourceClass", "sshKey"],
    },
    repositoriesResolved: resolvedCountControl(3),
    expiredDataConnectorsResolved: resolvedCountControl(2),
    sessionSecretsResolved: resolvedCountControl(3),
    storageCredentialsResolved: resolvedCountControl(3),
  },
};
