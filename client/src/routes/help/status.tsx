import { MetaFunction } from "react-router";

import StatusSummary from "~/features/platform/components/StatusSummary";

const TITLE = "RenkuLab Status | Help | Renku";

export const meta: MetaFunction = () => [{ title: TITLE }];

export default function HelpStatusPage() {
  return (
    <>
      <StatusSummary />
    </>
  );
}
