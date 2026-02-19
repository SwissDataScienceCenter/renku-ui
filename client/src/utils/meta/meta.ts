/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import { serverOnly$ } from "vite-env-only/macros";

import { CONFIG_JSON } from "./config.constants.server";
import {
  _DEFAULT_META_DESCRIPTION,
  _DEFAULT_META_IMAGE,
  _DEFAULT_META_LOCALE,
  _DEFAULT_META_TITLE_SEPARATOR,
} from "./meta._baseConstants";
import type { MetaDescriptor } from "./meta.types";

export function makeMetaTitle(
  elems: string[],
  sep: string = _DEFAULT_META_TITLE_SEPARATOR
): string {
  return elems.join(sep);
}

export const _DEFAULT_META_TITLE: string = makeMetaTitle([
  "Reproducible Data Science",
  "Open Research",
  "Renku",
]);

interface MakeMetaArgs {
  title?: string;
  description?: string;
  image?: string;
  baseUrl?: string;
}

const _BASE_URL: string | undefined =
  typeof window === "object"
    ? window.location.origin
    : serverOnly$(CONFIG_JSON.BASE_URL);

export function makeMeta({
  title = _DEFAULT_META_TITLE,
  description = _DEFAULT_META_DESCRIPTION,
  image = _DEFAULT_META_IMAGE,
  baseUrl = _BASE_URL,
}: MakeMetaArgs): MetaDescriptor[] {
  const imageUrl = baseUrl ? new URL(image, baseUrl).toString() : image;

  return [
    // Primary meta tags
    { title },
    {
      name: "title",
      content: title,
    },
    {
      name: "description",
      content: description,
    },

    // Open Graph / Facebook
    {
      property: "og:type",
      content: "website",
    },
    // TODO: og:url, example: <meta property="og:url" content="https://example.org/" />
    {
      property: "og:title",
      content: title,
    },
    {
      property: "og:description",
      content: description,
    },
    {
      property: "og:image",
      content: imageUrl,
    },
    {
      property: "og:locale",
      content: _DEFAULT_META_LOCALE,
    },

    // X (ex-Twitter)
    {
      property: "twitter:card",
      content: "summary_large_image",
    },
    // TODO: twitter:url, example: <meta property="twitter:url" content="https://example.org/" />
    {
      property: "twitter:title",
      content: title,
    },
    {
      property: "twitter",
      content: description,
    },
    {
      property: "twitter:image",
      content: imageUrl,
    },
  ];
}
