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
  type LoaderFunction,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { startCase } from "lodash-es";
import { env } from "node:process";

import { type Project } from "~/old-src/features/projectsV2/api/projectV2.api";
import App from "~/old-src/index";
import { DEFAULT_META, DEFAULT_META_DESCRIPTION } from "~/root";

export async function loader({
  params,
  request,
}: LoaderFunctionArgs): Promise<ReturnType<LoaderFunction>> {
  const { namespace, slug } = params;
  const cookie = request.headers.get("Cookie");

  const originUrl = new URL(request.url);
  const apiUrl = new URL("/api", env["GATEWAY_URL"] || originUrl);
  const projectUrl = `${apiUrl.href}/data/namespaces/${namespace}/projects/${slug}`;

  try {
    const projectResponse = await fetch(projectUrl, {
      headers: {
        ...(cookie ? { Cookie: cookie } : {}),
      },
    });
    if (projectResponse.status >= 400) {
      return json({ ok: false });
    }
    const projectData = await projectResponse.json();
    return json({ ok: true, project: projectData });
  } catch {
    return json({ ok: false });
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data.ok) {
    return DEFAULT_META;
  }

  const { name, visibility, description } = data.project as Project;

  const metaTitle = `${name} | ${startCase(visibility)} project on Renku`;
  const metaDescription = description || DEFAULT_META_DESCRIPTION;

  return [
    {
      title: metaTitle,
    },
    {
      name: "description",
      content: metaDescription,
    },
    {
      property: "og:title",
      content: metaTitle,
    },
    {
      property: "og:description",
      content: metaDescription,
    },
  ];
};

export default function ProjectRoute() {
  return <App />;
}
