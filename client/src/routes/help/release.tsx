import { type MetaDescriptor } from "react-router";

import HelpRelease from "~/features/help/HelpRelease";
import { makeMeta, makeMetaTitle } from "~/utils/meta/meta";

const title = makeMetaTitle(["Release and License", "Renku"]);
const meta_ = makeMeta({ title });

export function meta(): MetaDescriptor[] {
  return meta_;
}

export default function HelpReleasePage() {
  return <HelpRelease />;
}
