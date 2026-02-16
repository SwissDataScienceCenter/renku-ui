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

/**
 * Root route module
 *
 * Docs:
 * - https://reactrouter.com/api/framework-conventions/root.tsx
 * - https://reactrouter.com/start/framework/routing#root-route
 */

// import popperCore from "@popperjs/core?url";

import * as Sentry from "@sentry/react-router";
// import bootstrap from "bootstrap?url";
import cx from "classnames";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Helmet } from "react-helmet";
import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type MetaDescriptor,
  type MetaFunction,
} from "react-router";

// import v2Styles from "~/styles/renku_bootstrap.scss?url";
import { CONFIG_JSON } from "~server/constants";
import type { Route } from "./+types/root";
import AppRoot from "./AppRoot";
import PageLoader from "./components/PageLoader";
import NotFound from "./not-found/NotFound";
import type { AppParams } from "./utils/context/appParams.types";
import { validatedAppParams } from "./utils/context/appParams.utils";
import { initClientSideSentry } from "./utils/helpers/sentry/utils";

import "~/styles/renku_bootstrap.scss";
import "./utils/bootstrap/bootstrap.client";

// import LazyBootstrap from "./utils/bootstrap/LazyBootstrap";

// import "bootstrap";

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

type ServerLoaderReturn_ =
  | { clientSideFetch: true; config: undefined }
  | { clientSideFetch: false; config: typeof CONFIG_JSON };
type ServerLoaderReturn = ReturnType<typeof data<ServerLoaderReturn_>>;

export async function loader(): Promise<ServerLoaderReturn> {
  //? How to server-side load data for GET /api/data/user
  // let user: UserInfo | null = null;
  // const cookie = request.headers.get("cookie");
  // if (cookie != null && cookie.includes("_renku_session")) {
  //   const userUrl = new URL(CONFIG_JSON.GATEWAY_URL + "/data/user");
  //   const response = await fetch(userUrl.toString(), {
  //     headers: { cookie },
  //   });
  //   if (response.status >= 200 && response.status < 300) {
  //     const userData = await response.json();
  //     user = {
  //       ...userData,
  //       isLoggedIn: true,
  //     } satisfies LoggedInUserInfo;
  //   } else {
  //     user = {
  //       isLoggedIn: false,
  //     } satisfies AnonymousUserInfo;
  //   }
  // }
  // console.log({ user });

  const clientSideFetch =
    process.env.NODE_ENV === "development" || process.env.CYPRESS === "1";
  if (clientSideFetch) {
    return data({
      clientSideFetch,
      config: undefined,
    });
  }

  //? In production, directly load what we would return for /config.json
  return data({
    clientSideFetch,
    config: CONFIG_JSON,
  });
}

type ClientLoaderReturn = {
  clientSideFetch: boolean;
  config: typeof CONFIG_JSON;
};

const clientCache = new Map<"config", typeof CONFIG_JSON>();

export async function clientLoader({
  serverLoader,
}: Route.ClientLoaderArgs): Promise<ClientLoaderReturn> {
  const { config, clientSideFetch } = await serverLoader();
  //? Load the config.json contents from localhost in development
  if (clientSideFetch) {
    const cached = clientCache.get("config");
    if (cached != null) {
      return { config: cached, clientSideFetch };
    }
    const configResponse = await fetch("/config.json");
    const configData = await configResponse.json();
    clientCache.set("config", configData);
    return { config: configData as typeof CONFIG_JSON, clientSideFetch };
  }
  return { config, clientSideFetch };
}
clientLoader.hydrate = true as const;

// Layout for the root route
// Reference: https://reactrouter.com/api/framework-conventions/root.tsx#layout-export
export function Layout({ children }: { children: ReactNode }) {
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

        {/* <link rel="stylesheet" type="text/css" href={v2Styles} /> */}

        <Meta />
        <Links />
      </head>
      <body>
        <div id="root" className={cx("d-flex", "flex-column", "min-vh-100")}>
          {children}
        </div>
        <Scripts />
        <ScrollRestoration />
        {/* <LazyBootstrap /> */}
        {/* <script type="module" async src={popperCore} />
        <script type="module" async src={bootstrap} /> */}
      </body>
    </html>
  );
}

// Fallback content shown if a server-side error occurs
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    return (
      <>
        <Helmet>
          <title>Page Not Found | Renku</title>
        </Helmet>
        <NotFound forceV2={true} />
      </>
    );
  } else if (error instanceof Error) {
    Sentry.captureException(error);
    return (
      <>
        <Helmet>
          <title>Error | Renku</title>
        </Helmet>
        <div>
          <h1>Error</h1>
          <p>{error.message}</p>
        </div>
      </>
    );
  }
  return <h1>Unknown Error</h1>;
}

// Fallback content while client-side data is awaited
export function HydrateFallback() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <>
      <Helmet>
        <title>Loading Renku page...</title>
      </Helmet>
      {isHydrated && <PageLoader />}
    </>
  );
}

export const meta: MetaFunction = () => {
  return DEFAULT_META;
};

export default function Root({ loaderData }: Route.ComponentProps) {
  const params = useMemo(
    () => validatedAppParams(loaderData.config),
    [loaderData.config]
  );
  const isClientSide = typeof window === "object";
  if (isClientSide) {
    if (params.SENTRY_URL && !Sentry.isInitialized()) {
      initClientSideSentry(params);
    }
  }
  return (
    <>
      <Helmet>
        <title>{DEFAULT_META_TITLE}</title>
      </Helmet>
      <AppRoot params={params}>
        <Outlet context={{ params } satisfies RootOutletContext} />
      </AppRoot>
    </>
  );
}

export type RootOutletContext = {
  params: AppParams;
};
