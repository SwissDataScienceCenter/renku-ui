/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  json,
  type LoaderFunctionArgs,
  type LoaderFunction,
  type MetaFunction,
} from "@remix-run/node";
import { env } from "node:process";
import { startCase } from "lodash-es";

import { type Project } from "~/old-src/features/projectsV2/api/projectV2.api";
import App from "~/old-src/newIndex";

export async function loader({
  params,
  request,
}: LoaderFunctionArgs): Promise<ReturnType<LoaderFunction>> {
  const { namespace, slug } = params;
  console.log({ namespace, slug });

  const cookie = request.headers.get("Cookie");
  console.log({ cookie: cookie?.length });

  const originUrl = new URL(request.url);
  console.log({ originUrl: originUrl.href });

  console.log({ GATEWAY_URL: env["GATEWAY_URL"] });

  const apiUrl = new URL("/api", env["GATEWAY_URL"] || originUrl);
  console.log({ apiUrl: apiUrl.href });

  const projectUrl = `${apiUrl.href}/data/namespaces/${namespace}/projects/${slug}`;
  console.log({ projectUrl });

  try {
    const projectResponse = await fetch(projectUrl, {
      headers: {
        ...(cookie ? { Cookie: cookie } : {}),
      },
    });
    const projectData = await projectResponse.json();
    return json({ ok: true, project: projectData });
  } catch {
    return json({ ok: false });
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data.ok) {
    return [];
  }

  const { name, visibility, description } = data.project as Project;

  return [
    {
      title: `${name} | ${startCase(visibility)} project on Renku`,
    },
    {
      name: "description",
      content: description,
    },
    {
      property: "og:title",
      content: name,
    },
    {
      property: "og:description",
      content: description,
    },
  ];
};

export default function ProjectRoute() {
  return <App />;
}
