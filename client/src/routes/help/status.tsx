import { Helmet } from "react-helmet";
import { type MetaDescriptor } from "react-router";

import StatusSummary from "~/features/platform/components/StatusSummary";
import { DEFAULT_META } from "~/root";

const TITLE = "RenkuLab Status | Help | Renku";

export function meta(): MetaDescriptor[] {
  const result = [{ title: TITLE }, ...DEFAULT_META.slice(1)];
  return result;
}

export default function HelpReleasePage() {
  return (
    <>
      <Helmet>
        <title>{TITLE}</title>
      </Helmet>
      <StatusSummary />
    </>
  );
}
