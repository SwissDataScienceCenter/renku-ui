import { type MetaDescriptor } from "react-router";

import StatusSummary from "~/features/platform/components/StatusSummary";
import { makeMeta, makeMetaTitle } from "~/utils/meta/meta";

const title = makeMetaTitle(["RenkuLab Status", "Renku"]);
const meta_ = makeMeta({ title });

export function meta(): MetaDescriptor[] {
  return meta_;
}

export default function HelpStatusPage() {
  return <StatusSummary />;
}
