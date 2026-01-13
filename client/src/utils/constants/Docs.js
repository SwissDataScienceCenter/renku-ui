/**
 *  renku-ui
 *
 *  utils/Docs.js
 *  Docs utils
 */

const READ_THE_DOCS_ROOT = "https://renku.readthedocs.io/en/stable";

const Docs = {
  READ_THE_DOCS_DEVELOPER: `${READ_THE_DOCS_ROOT}/developer`,
  READ_THE_DOCS_HOW_TO_GUIDES: `${READ_THE_DOCS_ROOT}/how-to-guides`,
  READ_THE_DOCS_INTRODUCTION: `${READ_THE_DOCS_ROOT}/introduction`,
  READ_THE_DOCS_REFERENCE: `${READ_THE_DOCS_ROOT}/reference`,
  READ_THE_DOCS_RENKU_PYTHON: `${READ_THE_DOCS_ROOT}/renku-python`,
  READ_THE_DOCS_ROOT: READ_THE_DOCS_ROOT,
  READ_THE_DOCS_TUTORIALS: `${READ_THE_DOCS_ROOT}/tutorials`,
  // eslint-disable-next-line
  READ_THE_DOCS_TUTORIALS_STARTING: `${READ_THE_DOCS_ROOT}/tutorials/01_firststeps.html`,
  READ_THE_DOCS_WHY_RENKU: `${READ_THE_DOCS_ROOT}/introduction/why.html`,

  rtdHowToGuide(subPage) {
    return `${Docs.READ_THE_DOCS_HOW_TO_GUIDES}/${subPage}`;
  },
  rtdPythonReferencePage(subPage) {
    return `${Docs.READ_THE_DOCS_RENKU_PYTHON}/docs/reference/${subPage}`;
  },
  rtdReferencePage(subPage) {
    return `${Docs.READ_THE_DOCS_REFERENCE}/${subPage}`;
  },
  rtdTopicGuide(subPage) {
    return `${Docs.READ_THE_DOCS_ROOT}/topic-guides/${subPage}`;
  },
};

const Links = {
  DISCOURSE: "https://renku.discourse.group",
  GITTER: "https://gitter.im/SwissDataScienceCenter/renku",
  GITHUB: "https://github.com/SwissDataScienceCenter/renku",
  HOMEPAGE: "https://datascience.ch",
  MASTODON: "https://fosstodon.org/@renku",
  MEDIUM: "https://medium.com/the-renku-blog",
  YOUTUBE: "https://www.youtube.com/channel/UCMF2tBtWU1sKWvtPl_HpI4A",
  SDSC: "https://www.datascience.ch/",
  ETH: "https://ethrat.ch/en/",
  EPFL: "https://www.epfl.ch/en/",
  ETHZ: "https://ethz.ch/en.html",
  RENKU_BLOG: "https://blog.renkulab.io",
  RENKU_2_ADMIN_HOW_TO_GUIDE_INCIDENTS:
    "https://docs.renkulab.io/en/0.70.0/how-to-guides/admin/incidents-maintenance.html",
  RENKU_2_LEARN_MORE: "https://blog.renkulab.io/early-access",
  RENKU_2_EVENTS:
    "https://renku.notion.site/Renku-for-Events-18c0df2efafc800bb26ae93333b4318d",
  RENKU_2_SUNSET: "https://blog.renkulab.io/sunsetting-legacy/",
  RENKU_2_REGISTER_REDIRECT:
    "https://www.notion.so/renku/2540df2efafc80c5ac36c6ecf6a375a0?v=2540df2efafc80b1ae2b000cee3e5a3c#2540df2efafc80c5ac36c6ecf6a375a0",
};

const GitlabLinks = {
  PROJECT_VISIBILITY: "https://docs.gitlab.com/ee/user/public_access.html",
};

const REKNU_PYTHON_READ_THE_DOCS_ROOT =
  "https://renku-python.readthedocs.io/en/stable";

const RenkuPythonDocs = {
  READ_THE_DOCS_ROOT: REKNU_PYTHON_READ_THE_DOCS_ROOT,
};

export { Docs, GitlabLinks, Links, RenkuPythonDocs };
