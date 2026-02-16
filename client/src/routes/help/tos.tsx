import { Helmet } from "react-helmet";
import { type MetaDescriptor } from "react-router";

import TermsOfService from "~/help/TermsOfService";
import { DEFAULT_META } from "~/root";

const TITLE = "Terms of Service | Help | Renku";

export function meta(): MetaDescriptor[] {
  const result = [{ title: TITLE }, ...DEFAULT_META.slice(1)];
  return result;
}

export default function GettingHelpPage() {
  return (
    <>
      <Helmet>
        <title>{TITLE}</title>
      </Helmet>
      <TermsOfService />
    </>
  );
}
