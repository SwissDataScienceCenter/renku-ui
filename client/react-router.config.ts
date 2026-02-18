import type { Config } from "@react-router/dev/config";

// import { sentryOnBuildEnd } from "@sentry/react-router";

export default {
  appDirectory: "src",
  ssr: true,

  // TODO: configure Sentry integration for source maps
  // TODO: Reference: https://docs.sentry.io/platforms/javascript/guides/react-router/manual-setup/#step-3-add-readable-stack-traces-with-source-maps-optional
  // Sentry release hook
  // buildEnd: async (
  //   {
  //     viteConfig: viteConfig,
  //     reactRouterConfig: reactRouterConfig,
  //     buildManifest: buildManifest
  //   }
  // ) => {
  //   await sentryOnBuildEnd({
  //     viteConfig: viteConfig,
  //     reactRouterConfig: reactRouterConfig,
  //     buildManifest: buildManifest
  //   });
  // }
} satisfies Config;
