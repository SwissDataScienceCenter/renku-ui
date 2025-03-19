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

import { type NamespaceResponse } from "~/old-src/features/projectsV2/api/namespace.api";
import { type UserWithId } from "~/old-src/features/usersV2/api/users.api";
import App from "~/old-src/index";
import { DEFAULT_META, DEFAULT_META_DESCRIPTION } from "~/root";
import { getBaseApiUrl } from "~/server-side/utils";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { username } = params;

  const apiUrl = getBaseApiUrl({ requestUrl: request.url });
  const namespaceUrl = `${apiUrl}/data/namespaces/${username}`;

  try {
    const namespaceResponse = await fetch(namespaceUrl);
    if (namespaceResponse.status >= 400) {
      return { ok: false } as const;
    }
    const namespaceData = (await namespaceResponse.json()) as NamespaceResponse;
    if (namespaceData.namespace_kind !== "user" || !namespaceData.created_by) {
      return { ok: false } as const;
    }

    const userUrl = `${apiUrl}/data/users/${namespaceData.created_by}`;
    const userResponse = await fetch(userUrl);
    if (userResponse.status >= 400) {
      return { ok: false } as const;
    }
    const userData = (await userResponse.json()) as UserWithId;
    return { ok: true, user: userData } as const;
  } catch {
    return { ok: false } as const;
  }
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (data == null || !data.ok) {
    return DEFAULT_META;
  }

  const { first_name, last_name, username } = data.user;
  const fullName =
    first_name && last_name
      ? `${first_name} ${last_name}`
      : first_name
      ? first_name
      : last_name || "unknown";

  const metaTitle = `${fullName} (@${username}) | User profile on Renku`;

  return [
    {
      title: metaTitle,
    },
    {
      name: "description",
      content: DEFAULT_META_DESCRIPTION,
    },
    {
      property: "og:title",
      content: metaTitle,
    },
    {
      property: "og:description",
      content: DEFAULT_META_DESCRIPTION,
    },
  ];
};

export default function UserRoute() {
  return <App />;
}
