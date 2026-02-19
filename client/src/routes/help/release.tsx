import { Helmet } from "react-helmet";
import { type MetaDescriptor } from "react-router";

import HelpRelease from "~/features/help/HelpRelease";
import { DEFAULT_META } from "~/root";

const TITLE = "Release and License | Help | Renku";

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
      <HelpRelease />
    </>
  );
}
