// function safeJsonToObject(value: string | undefined) {
function safeJsonToObject(value) {
  if (value == null) return value;
  try {
    return JSON.parse(value);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Failed to parse JSON string:", e);
    return value;
  }
}

export const BASE_URL = process.env.BASE_URL;
export const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}</loc>
  </url>
  <url>
    <loc>${BASE_URL}/search</loc>
  </url>
  <url>
    <loc>${BASE_URL}/projects</loc>
  </url>
  <url>
    <loc>${BASE_URL}/datasets</loc>
  </url>
  <url>
    <loc>${BASE_URL}/help</loc>
  </url>
  <url>
    <loc>${BASE_URL}/help/status</loc>
  </url>
  <url>
    <loc>${BASE_URL}/help/release</loc>
  </url>
</urlset>`;
export const ROBOTS = `Sitemap: ${BASE_URL} /sitemap.xml`;
export const CONFIG_JSON = {
  UI_VERSION: process.env.UI_VERSION || "",
  RENKU_CHART_VERSION: process.env.RENKU_CHART_VERSION,
  UI_SHORT_SHA: process.env.RENKU_UI_SHORT_SHA,
  BASE_URL: process.env.BASE_URL || "http://renku.build",
  GATEWAY_URL: process.env.GATEWAY_URL || "http://gateway.renku.build",
  UISERVER_URL: process.env.UISERVER_URL || "http://uiserver.renku.build",
  KEYCLOAK_REALM: process.env.KEYCLOAK_REALM || "Renku",
  DASHBOARD_MESSAGE: safeJsonToObject(process.env.DASHBOARD_MESSAGE),
  SENTRY_URL: process.env.SENTRY_URL,
  SENTRY_NAMESPACE: process.env.SENTRY_NAMESPACE,
  SENTRY_SAMPLE_RATE: process.env.SENTRY_SAMPLE_RATE,
  MAINTENANCE: process.env.MAINTENANCE,
  ANONYMOUS_SESSIONS: process.env.ANONYMOUS_SESSIONS,
  PRIVACY_BANNER_ENABLED: process.env.PRIVACY_BANNER_ENABLED,
  PRIVACY_BANNER_CONTENT: process.env.PRIVACY_BANNER_CONTENT,
  PRIVACY_BANNER_LAYOUT: safeJsonToObject(process.env.PRIVACY_BANNER_LAYOUT),
  TERMS_PAGES_ENABLED: process.env.TERMS_PAGES_ENABLED,
  TERMS_CONTENT: process.env.TERMS_CONTENT || "",
  PRIVACY_CONTENT: process.env.PRIVACY_CONTENT || "",
  TEMPLATES: safeJsonToObject(process.env.TEMPLATES),
  PREVIEW_THRESHOLD: safeJsonToObject(process.env.PREVIEW_THRESHOLD),
  UPLOAD_THRESHOLD: safeJsonToObject(process.env.UPLOAD_THRESHOLD),
  STATUSPAGE_ID: process.env.STATUSPAGE_ID,
  HOMEPAGE: safeJsonToObject(process.env.HOMEPAGE),
  CORE_API_VERSION_CONFIG: safeJsonToObject(
    process.env.CORE_API_VERSION_CONFIG
  ),
  USER_PREFERENCES_MAX_PINNED_PROJECTS:
    process.env.USER_PREFERENCES_MAX_PINNED_PROJECTS,
  SESSION_CLASS_EMAIL_US: safeJsonToObject(process.env.SESSION_CLASS_EMAIL_US),
  IMAGE_BUILDERS_ENABLED: process.env.IMAGE_BUILDERS_ENABLED,
  LEGACY_SUPPORT: safeJsonToObject(process.env.LEGACY_SUPPORT),
};

export const SAMPLE_PRIVACY_CONTENT = `# Privacy statement
The content of this page is only a template.
## Information
If you are reading this message, the Privacy page content has not been updated for this RenkuLab deployment.
The following content is intended to be read by a RenkuLab admin.
## Configure the Privacy Page
You should customize the privacy statement in the Helm chart values file at \`ui.client.privacy.page.privacyPolicyContent\`.
Any markdown formatted text works.
If you do not wish to see this at all, then you can turn off this page and the terms of use page by setting \`ui.client.privacy.page.enabled\` to false.
Consider changing the cookie banner content as well when the privacy page is not available.
`;

export const SAMPLE_TERMS_CONTENT = `# Terms of Use
The content of this page is only a template.
## Information
If you are reading this message, the Terms of Use page content has not been updated for this RenkuLab deployment.
The following content is intended to be read by a RenkuLab admin.
## Configure the Terms of Use
You should customize the terms of use content in the Helm chart values file at \`ui.client.privacy.page.termsContent\`.
Any markdown formatted text works.
If you do not wish to see this at all, then you can turn off this page and privacy statement page by setting \`ui.client.privacy.page.enabled\` to false.
`;
