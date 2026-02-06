import type { Config } from "@react-router/dev/config";

// import { sentryOnBuildEnd } from "@sentry/react-router";

export default {
  appDirectory: "src",
  ssr: true,

  // TODO: configure this maybe?
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
