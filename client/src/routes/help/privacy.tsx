import { data, type MetaDescriptor } from "react-router";

import PrivacyPolicy from "~/features/help/PrivacyPolicy";
import { makeMeta, makeMetaTitle } from "~/utils/meta/meta";

const title = makeMetaTitle(["Page Not Found", "Renku"]);
const meta_ = makeMeta({ title });

export function meta(): MetaDescriptor[] {
  return meta_;
}
export async function loader() {
  return data(undefined, { status: 404 });
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicy />;
}
