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

import v2Styles from "~/styles/renku_bootstrap.scss?url";
import cx from "classnames";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type MetaDescriptor,
  type MetaFunction,
} from "react-router";
import type { Route } from "./+types/root";
import NotFound from "./not-found/NotFound";

export const DEFAULT_META_TITLE: string =
  "Reproducible Data Science | Open Research | Renku";

export const DEFAULT_META_DESCRIPTION: string =
  "Work together on data science projects reproducibly. Share code, data and computational environments whilst accessing free computing resources."; // eslint-disable-line spellcheck/spell-checker

export const DEFAULT_META: MetaDescriptor[] = [
  {
    title: DEFAULT_META_TITLE,
  },
  {
    name: "description",
    content:
      "An open-source platform for reproducible and collaborative data science. Share code, data and computational environments whilst tracking provenance and lineage of research objects.",
  },
  {
    property: "og:title",
    content: DEFAULT_META_TITLE,
  },
  {
    property: "og:description",
    content: DEFAULT_META_DESCRIPTION,
  },
];

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    return (
      <html lang="en">
        <head>
          <link rel="stylesheet" type="text/css" href={v2Styles} />
          <title>Page Not Found | Renku</title>
          <Links />
        </head>
        <body>
          <NotFound forceV2={true} />
        </body>
      </html>
    );
  } else if (error instanceof Error) {
    return (
      <html lang="en">
        <head>
          <link rel="stylesheet" type="text/css" href={v2Styles} />
          <title>Error | Renku</title>
          <Links />
        </head>
        <body>
          <div>
            <h1>Error</h1>
            <p>{error.message}</p>
          </div>
        </body>
      </html>
    );
  }
  return <h1>Unknown Error</h1>;
}

export const meta: MetaFunction = () => {
  return DEFAULT_META;
};

export default function Root() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="theme-color" content="#000000" />
        {/*
        manifest.json provides metadata used when your web app is added to the
        homescreen on Android. See https://developers.google.com/web/fundamentals/engage-and-retain/web-app-manifest/
        */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon-180x180.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="root" className={cx("d-flex", "flex-column", "min-vh-100")}>
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
