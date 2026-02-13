import { Helmet } from "react-helmet";
import { type MetaDescriptor } from "react-router";

import NewHelpRoot from "~/features/help/NewHelpRoot";
import { DEFAULT_META } from "~/root";

const TITLE = "Getting Help | Renku";

export function meta(): MetaDescriptor[] {
  const result = [{ title: TITLE }, ...DEFAULT_META.slice(1)];
  return result;
}

export default function NewHelpPages() {
  return (
    <>
      <Helmet>
        <title>{TITLE}</title>
      </Helmet>
      <NewHelpRoot />
    </>
  );
}
