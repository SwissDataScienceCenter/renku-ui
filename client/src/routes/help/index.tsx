import { type MetaDescriptor } from "react-router";

import GettingHelp from "~/features/help/GettingHelp";
import { makeMeta, makeMetaTitle } from "~/utils/meta/meta";

const title = makeMetaTitle(["Getting Help", "Renku"]);
const meta_ = makeMeta({ title });

export function meta(): MetaDescriptor[] {
  return meta_;
}

export default function GettingHelpPage() {
  return <GettingHelp />;
}
