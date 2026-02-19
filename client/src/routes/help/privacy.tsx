import { type MetaDescriptor } from "react-router";

import PrivacyPolicy from "~/features/help/PrivacyPolicy";
import { makeMeta, makeMetaTitle } from "~/utils/meta/meta";

const title = makeMetaTitle(["Privacy Policy", "Renku"]);
const meta_ = makeMeta({ title });

export function meta(): MetaDescriptor[] {
  return meta_;
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}
