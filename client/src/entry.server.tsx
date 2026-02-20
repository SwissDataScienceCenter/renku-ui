import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import * as Sentry from "@sentry/react-router";
import { isbot } from "isbot";
import type { RenderToPipeableStreamOptions } from "react-dom/server";
import { renderToPipeableStream } from "react-dom/server";
import type { AppLoadContext, EntryContext } from "react-router";
import { ServerRouter } from "react-router";

import {
  EXCLUDED_URLS,
  getRelease,
  NAMESPACE_DEFAULT,
  UI_COMPONENT,
  VERSION_DEFAULT,
} from "./utils/helpers/sentry/utils";

export const streamTimeout = 5_000;

function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _loadContext: AppLoadContext
  // If you have middleware enabled:
  // loadContext: RouterContextProvider
): Promise<Response> {
  // https://httpwg.org/specs/rfc9110.html#HEAD
  if (request.method.toUpperCase() === "HEAD") {
    return Promise.resolve(
      new Response(null, {
        status: responseStatusCode,
        headers: responseHeaders,
      })
    );
  }

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const userAgent = request.headers.get("user-agent");

    // Ensure requests from bots and SPA Mode renders wait for all content to load before responding
    // https://react.dev/reference/react-dom/server/renderToPipeableStream#waiting-for-all-content-to-load-for-crawlers-and-static-generation
    const readyOption: keyof RenderToPipeableStreamOptions =
      (userAgent && isbot(userAgent)) || routerContext.isSpaMode
        ? "onAllReady"
        : "onShellReady";

    // Abort the rendering stream after the `streamTimeout` so it has time to
    // flush down the rejected boundaries
    let timeoutId: ReturnType<typeof setTimeout> | undefined = setTimeout(
      () => abort(),
      streamTimeout + 1000
    );

    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              // Clear the timeout to prevent retaining the closure and memory leak
              clearTimeout(timeoutId);
              timeoutId = undefined;
              callback();
            },
          });
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          // this enables distributed tracing between client and server
          pipe(Sentry.getMetaTagTransformer(body));

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            // eslint-disable-next-line no-console
            console.error(error);
          }
        },
      }
    );
  });
}

const wrappedHandleRequest = Sentry.wrapSentryHandleRequest(handleRequest);
export default wrappedHandleRequest;

export const handleError = Sentry.createSentryHandleError({
  logErrors: false,
});

if (process.env.NODE_ENV === "development") {
  // Fetch /config.json and initialize Sentry
  // NOTE: Some startup instrumentation may be missing
  const port = Number.parseInt(process.env.PORT || "3000", 10);
  fetch(`http://localhost:${port}/config.json`).then((res) => {
    res.json().then((params) => {
      const dsn = params.SENTRY_URL;
      const environment = params.SENTRY_NAMESPACE || NAMESPACE_DEFAULT;
      const release = getRelease(params.UI_VERSION || VERSION_DEFAULT);
      let tracesSampleRate = parseFloat(params.SENTRY_SAMPLE_RATE) || 0;
      if (tracesSampleRate < 0) {
        tracesSampleRate = 0;
      }
      if (tracesSampleRate > 1) {
        tracesSampleRate = 1;
      }
      /**
       * @type { Sentry.NodeOptions }
       */
      const config = {
        dsn,
        environment,
        release,
        denyUrls: [...EXCLUDED_URLS],
        tracesSampleRate,
      };
      Sentry.init(config);
      Sentry.setTags({
        component: UI_COMPONENT,
      });
    });
  });
}
