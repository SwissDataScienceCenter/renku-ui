import { type MetaDescriptor } from "react-router";

import TermsOfService from "~/features/help/TermsOfService";
import { makeMeta, makeMetaTitle } from "~/utils/meta/meta";

const title = makeMetaTitle(["Terms of Service", "Renku"]);
const meta_ = makeMeta({ title });

export function meta(): MetaDescriptor[] {
  return meta_;
}

export default function TermsOfServicePage() {
  return <TermsOfService />;
}
