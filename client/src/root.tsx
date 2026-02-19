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

import * as Sentry from "@sentry/react-router";
import cx from "classnames";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type MetaDescriptor,
} from "react-router";

import { CONFIG_JSON } from "~server/constants";
import type { Route } from "./+types/root";
import AppRoot from "./AppRoot";
import PageLoader from "./components/PageLoader";
import NotFound from "./not-found/NotFound";
import type { AppParams } from "./utils/context/appParams.types";
import { validatedAppParams } from "./utils/context/appParams.utils";
import { initClientSideSentry } from "./utils/helpers/sentry/utils";
import { makeMeta } from "./utils/meta/meta";

import "./styles/renku_bootstrap.scss";
import "./utils/bootstrap/bootstrap.client";

type ServerLoaderReturn_ =
  | { clientSideFetch: true; config: undefined }
  | { clientSideFetch: false; config: typeof CONFIG_JSON };
type ServerLoaderReturn = ReturnType<typeof data<ServerLoaderReturn_>>;

export async function loader(): Promise<ServerLoaderReturn> {
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

        <Meta />
        <Links />
      </head>
      <body>
        <div id="root" className={cx("d-flex", "flex-column", "min-vh-100")}>
          {children}
        </div>
        <Scripts />
        <ScrollRestoration />
      </body>
    </html>
  );
}

// Fallback content shown if a server-side error occurs
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    return (
      <>
        {/* <Helmet>
          <title>Page Not Found | Renku</title>
        </Helmet> */}
        <NotFound forceV2={true} />
      </>
    );
  } else if (error instanceof Error) {
    Sentry.captureException(error);
    return (
      <>
        {/* <Helmet>
          <title>Error | Renku</title>
        </Helmet> */}
        <div>
          <h1>Error</h1>
          <p>{error.message}</p>
          <pre>{error.stack}</pre>
        </div>
      </>
    );
  }
  return <h1>Unknown Error</h1>;
}

// Fallback content while client-side data is awaited
export function HydrateFallback() {
  const [isHydrated, setIsHydrated] = useState(false);
  // const ref = useRef<HTMLTitleElement>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // useEffect(() => {
  //   if (isHydrated && ref.current != null) {
  //     const titleTag = ref.current;
  //     const oldTitle = titleTag.innerText;
  //     titleTag.innerText = "Loading Renku page... · Renku";
  //     return () => {
  //       titleTag.innerText = oldTitle;
  //     };
  //   }
  // }, [isHydrated]);

  return (
    <>
      {/* {isHydrated && <title ref={ref}>{TITLE}</title>} */}
      {isHydrated && <PageLoader />}
    </>
  );
}

const meta_ = makeMeta({});

export function meta(): MetaDescriptor[] {
  return meta_;
}

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
      {/* <Helmet>
        <title>{DEFAULT_META_TITLE}</title>
      </Helmet> */}
      <AppRoot params={params}>
        <Outlet context={{ params } satisfies RootOutletContext} />
      </AppRoot>
    </>
  );
}

export type RootOutletContext = {
  params: AppParams;
};
