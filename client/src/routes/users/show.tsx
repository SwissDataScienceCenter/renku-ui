import { data } from "react-router";

import { getBaseApiUrl } from "~/utils/.server/getBaseApiUrl.ts";
import { makeMeta, makeMetaTitle } from "~/utils/meta/meta";
import type { Route } from "./+types/show";

export async function loader({ request }: Route.LoaderArgs) {
  const apiUrl = getBaseApiUrl(request.url);
  // TODO
  console.log({ apiUrl });
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 5_000);
  });
  console.log("loaded");
  return data({ result: "OK" });
}

export function meta({ loaderData, params }: Route.MetaArgs) {
  console.log("meta()");
  console.log({ loaderData });
  const { username } = params;
  const title = makeMetaTitle([`@${username}`, "User", "Renku"]);
  return makeMeta({
    title,
  });
}

export default function UserPage() {
  return <div>User page placeholder</div>;
}
