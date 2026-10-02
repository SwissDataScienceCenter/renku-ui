import { data, type MetaDescriptor } from "react-router";

import NotFound from "~/not-found/NotFound";
import { makeMeta, makeMetaTitle } from "~/utils/meta/meta";

const title = makeMetaTitle(["Page Not Found", "Renku"]);
const meta_ = makeMeta({ title });

export function meta(): MetaDescriptor[] {
  return meta_;
}
export async function loader() {
  return data(undefined, { status: 404 });
}

export default function IdCatchallPage() {
  return (
    <NotFound
      description={
        <>
          Links by id are only supported for projects, in the form{" "}
          <code>/id/p/&lt;project-id&gt;</code>.
        </>
      }
    />
  );
}
