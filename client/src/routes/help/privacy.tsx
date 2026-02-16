import { Helmet } from "react-helmet";
import { type MetaDescriptor } from "react-router";

import PrivacyPolicy from "~/help/PrivacyPolicy";
import { DEFAULT_META } from "~/root";

const TITLE = "Privacy Policy | Help | Renku";

export function meta(): MetaDescriptor[] {
  const result = [{ title: TITLE }, ...DEFAULT_META.slice(1)];
  return result;
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Helmet>
        <title>{TITLE}</title>
      </Helmet>
      <PrivacyPolicy />
    </>
  );
}
