import { MetaFunction } from "react-router";

import GettingHelp from "~/features/help/GettingHelp";
import { DEFAULT_META } from "~/root";

const TITLE = "Getting Help | Renku";

export const meta: MetaFunction = () => [
  { title: TITLE },
  ...DEFAULT_META.slice(1),
];

export default function GettingHelpPage() {
  return (
    <>
      <GettingHelp />
    </>
  );
}
