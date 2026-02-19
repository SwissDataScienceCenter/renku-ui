import { Helmet } from "react-helmet";
import { type MetaDescriptor } from "react-router";

import GettingHelp from "~/features/help/GettingHelp";
import { DEFAULT_META } from "~/root";

const TITLE = "Getting Help | Renku";

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
      <GettingHelp />
    </>
  );
}
