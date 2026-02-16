import { Helmet } from "react-helmet";
import { data, MetaDescriptor } from "react-router";

import NotFound from "~/not-found/NotFound";
import { DEFAULT_META } from "~/root";

const TITLE = "Page Not Found | Renku";

export function meta(): MetaDescriptor[] {
  const result = [{ title: TITLE }, ...DEFAULT_META.slice(1)];
  return result;
}

export async function loader() {
  return data(undefined, { status: 404 });
}

export default function HelpCatchallPage() {
  return (
    <>
      <Helmet>
        <title>{TITLE}</title>
      </Helmet>
      <NotFound />
    </>
  );
}
