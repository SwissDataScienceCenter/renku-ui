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

import { type LoaderFunctionArgs, type MetaFunction } from "@remix-run/node";

import { type GroupResponse } from "~/old-src/features/projectsV2/api/namespace.api";
import App from "~/old-src/index";
import { DEFAULT_META, DEFAULT_META_DESCRIPTION } from "~/root";
import { getBaseApiUrl } from "~/server-side/utils";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { namespace } = params;

  const apiUrl = getBaseApiUrl({ requestUrl: request.url });
  const groupUrl = `${apiUrl}/data/groups/${namespace}`;

  try {
    const groupResponse = await fetch(groupUrl);
    if (groupResponse.status >= 400) {
      return { ok: false } as const;
    }
    const groupData = (await groupResponse.json()) as GroupResponse;
    return { ok: true, group: groupData } as const;
  } catch {
    return { ok: false } as const;
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (data == null || !data.ok) {
    return DEFAULT_META;
  }

  const { name, description } = data.group;

  const metaTitle = `${name} | Group on Renku`;
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

export default function UserRoute() {
  return <App />;
}
