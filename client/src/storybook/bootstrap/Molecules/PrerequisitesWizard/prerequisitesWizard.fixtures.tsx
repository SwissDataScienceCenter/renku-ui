import cx from "classnames";
import { Clock, CodeSquare } from "react-bootstrap-icons";

import type { PrerequisitesWizardProps } from "~/components/prerequisitesWizard/PrerequisitesWizard";
import type { WizardStep } from "~/components/prerequisitesWizard/prerequisitesWizard.types";

export type JobStepId =
  | "review"
  | "repositories"
  | "expiredDataConnectors"
  | "sessionSecrets"
  | "storageCredentials";

export type SessionStepId =
  | "resourceClass"
  | "repositories"
  | "expiredDataConnectors"
  | "sessionSecrets"
  | "sshKey"
  | "storageCredentials";

export type StepId = JobStepId | SessionStepId;

export const JOB_STEP_IDS: JobStepId[] = [
  "review",
  "repositories",
  "expiredDataConnectors",
  "sessionSecrets",
  "storageCredentials",
];

export const SESSION_STEP_IDS: SessionStepId[] = [
  "resourceClass",
  "repositories",
  "expiredDataConnectors",
  "sessionSecrets",
  "sshKey",
  "storageCredentials",
];

type StepDefinition =
  | {
      label: string;
      kind: "single";
      isRequired?: boolean;
      pendingText?: string;
      description?: string;
    }
  | {
      label: string;
      kind: "multi";
      total: number;
      description?: string;
    };

const STEP_DEFINITIONS: Record<StepId, StepDefinition> = {
  review: {
    label: "Review job",
    kind: "single",
    isRequired: false,
    pendingText: "To review",
    description:
      "Check how this job will run. Submission ID and job command are required.",
  },
  resourceClass: {
    label: "Resource class",
    kind: "single",
    isRequired: true,
    pendingText: "Required",
    description:
      "You don't have access to the default resource class of this session launcher. Choose one to launch; the session can't start without it.",
  },
  repositories: {
    label: "Repositories",
    kind: "multi",
    total: 3,
    description:
      "Some repositories need an integration. Repositories without access won't be cloned.",
  },
  expiredDataConnectors: {
    label: "Expired data connectors",
    kind: "multi",
    total: 2,
    description:
      "Expired data connectors won't be mounted until an owner refreshes them.",
  },
  sessionSecrets: {
    label: "Session secrets",
    kind: "multi",
    total: 3,
    description: "Slots without a value won't be mounted.",
  },
  sshKey: {
    label: "SSH key",
    kind: "multi",
    total: 1,
    description:
      "This session is set up for SSH access, but your account has no SSH key yet. Without one, you won't be able to connect to the session over SSH.",
  },
  storageCredentials: {
    label: "Storage credentials",
    kind: "multi",
    total: 3,
    description: "Data connectors without credentials won't be mounted.",
  },
};

export interface StepState {
  isSatisfied?: boolean;
  resolved?: number;
  total?: number;
}

export type StepStates = Partial<Record<StepId, StepState>>;

export function StepPlaceholder({ label }: { label: string }) {
  return (
    <div
      className={cx(
        "align-items-center",
        "border",
        "d-flex",
        "justify-content-center",
        "p-5",
        "rounded-3",
        "small",
        "text-body-secondary",
        "text-center",
      )}
      style={{ borderStyle: "dashed", minHeight: "16rem" }}
    >
      [{label} content, as in the main mockups]
    </div>
  );
}

export function buildSteps(ids: StepId[], states: StepStates = {}) {
  return ids.map((id): WizardStep => {
    const definition = STEP_DEFINITIONS[id];
    const state = states[id] ?? {};
    const content = <StepPlaceholder label={definition.label} />;
    if (definition.kind === "multi") {
      return {
        ...definition,
        id,
        resolved: state.resolved ?? 0,
        total: state.total ?? definition.total,
        content,
      };
    }
    return {
      ...definition,
      id,
      isSatisfied: state.isSatisfied ?? false,
      content,
    };
  });
}

function LauncherMeta() {
  return (
    <div className={cx("d-flex", "flex-column", "gap-1")}>
      <span>
        <CodeSquare aria-hidden="true" className={cx("bi", "me-1")} />
        Code based environment
      </span>
      <span>
        <Clock aria-hidden="true" className={cx("bi", "me-1")} />
        Last successfully built 1 hour ago
      </span>
    </div>
  );
}

type WizardFlowConfig = Pick<
  PrerequisitesWizardProps,
  | "summaryDetails"
  | "summaryTitle"
  | "skipAllLabel"
  | "submitDisabledReason"
  | "submitLabel"
  | "submitOutcome"
  | "title"
>;

export const JOB_WIZARD_CONFIG: WizardFlowConfig = {
  summaryDetails: <LauncherMeta />,
  summaryTitle: "Model training",
  skipAllLabel: "Submit now",
  submitDisabledReason: "Review the job first.",
  submitLabel: "Submit job",
  submitOutcome: "submits the job",
  title: "Review job and verify prerequisites",
};

export const SESSION_WIZARD_CONFIG: WizardFlowConfig = {
  summaryDetails: <LauncherMeta />,
  summaryTitle: "Python - Data Science - JupyterLab",
  skipAllLabel: "Launch now",
  submitLabel: "Launch session",
  submitOutcome: "launches the session",
  title: "Verify prerequisites and launch session",
};

export const RESOURCE_CLASS_REQUIRED_REASON = "Choose a resource class first.";

export const JOB_FIRST_STEP_STATES: StepStates = {
  repositories: { resolved: 2 },
};

export const SESSION_MID_FLOW_STATES: StepStates = {
  resourceClass: { isSatisfied: true },
  repositories: { resolved: 3 },
  expiredDataConnectors: { resolved: 1 },
};

export const SESSION_MID_FLOW_VISITED: SessionStepId[] = [
  "resourceClass",
  "repositories",
  "expiredDataConnectors",
  "sessionSecrets",
];

export const SESSION_ALL_RESOLVED_STATES: StepStates = {
  resourceClass: { isSatisfied: true },
  repositories: { resolved: 3 },
  expiredDataConnectors: { resolved: 2 },
  sessionSecrets: { resolved: 3 },
  sshKey: { isSatisfied: true },
  storageCredentials: { resolved: 3 },
};
