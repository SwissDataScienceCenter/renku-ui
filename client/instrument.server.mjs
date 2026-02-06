import * as Sentry from "@sentry/react-router";

const NAMESPACE_DEFAULT = "unknown";
const VERSION_DEFAULT = "unknown";
const RELEASE_UNKNOWN = "unknown";
const RELEASE_DEV = "-dev";
const UI_COMPONENT = "renku-ui";
const EXCLUDED_URLS = [
  /extensions\//i, // Chrome extensions 1
  /^chrome:\/\//i, // Chrome extensions 2
];

function getRelease(version) {
  // Check input validity
  if (!version || typeof version !== "string") return RELEASE_UNKNOWN;

  // Check format validity
  const regValid = new RegExp(/^\d*(\.\d*){0,2}(-[a-z0-9.]{7,32})?$/);
  const resValid = version.match(regValid);
  if (!resValid || !resValid[0]) return RELEASE_UNKNOWN;

  // Extract information
  const regRelease = new RegExp(/^\d*(\.\d*){0,2}/);
  const resRelease = version.match(regRelease);
  const release =
    !resRelease || !resRelease[0] ? RELEASE_UNKNOWN : resRelease[0];
  const regPatch = new RegExp(/-[a-z0-9.]{6,32}$/);
  const resPatch = version.match(regPatch);
  const patch = !resPatch || !resPatch[0] ? "" : RELEASE_DEV;
  return release + patch;
}

if (process.env.NODE_ENV !== "development") {
  // Initialize Sentry based on env vars
  const dsn = process.env.SENTRY_URL;
  if (dsn) {
    const environment = process.env.SENTRY_NAMESPACE || NAMESPACE_DEFAULT;
    const release = getRelease(process.env.UI_VERSION || VERSION_DEFAULT);
    let tracesSampleRate = parseFloat(process.env.SENTRY_SAMPLE_RATE) || 0;
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
  }
}
