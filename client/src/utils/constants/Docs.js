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
  CONTACT_US:
    "https://renku.notion.site/Contact-dd098db288ff433893a4d4d429da99c1",
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
  RENKU_2_LEARN_MORE: "https://blog.renkulab.io/early-access",
  RENKU_2_MIGRATION_INFO:
    "https://renku.notion.site/How-to-migrate-a-Renku-1-0-project-to-Renku-2-0-1ac0df2efafc80a88e58e2b3db035110",
  RENKU_2_HOW_TO_USE_OWN_DOCKER_IMAGE:
    "https://renku.notion.site/How-to-use-your-own-docker-image-for-a-session-launcher-11f0df2efafc80af848ffcaf9ccff31c",
  RENKU_2_COMMUNITY_PORTAL:
    "https://renku.notion.site/Renku-Community-Portal-2a154d7d30b24ab8a5968c60c2592d87",
  RENKU_2_DOCUMENTATION:
    "https://renku.notion.site/Documentation-db396cfc9a664cd2b161e4c6068a5ec9",
  RENKU_2_RESEARCH:
    "https://renku.notion.site/Renku-for-Data-Scientists-21d46b16e76e4bc484add8367c44f884",
  RENKU_2_TEACHING:
    "https://renku.notion.site/Renku-for-Teaching-1460df2efafc809cb134d2a4e32ed90e",
  RENKU_2_EVENTS:
    "https://renku.notion.site/Renku-for-Events-18c0df2efafc800bb26ae93333b4318d",
  RENKU_2_QUICK_START_TUTORIAL:
    "https://renku.notion.site/Get-started-with-Renku-1a50df2efafc800f8554e30fd7458fa6",
  RENKU_2_GET_HELP:
    "https://renku.notion.site/Get-help-1a2b4b7b0e4746769e246c0328d3d3ad",
  RENKU_2_WHY_RENKU:
    "https://renku.notion.site/Why-Renku-1900df2efafc80839b26cbad43f24778",
  RENKU_2_HANDS_ON_TUTORIAL:
    "https://renku.notion.site/Hands-On-Tutorial-1a50df2efafc800f8554e30fd7458fa6",
  RENKU_2_MIGRATE_AWAY_FROM_GITLAB:
    "https://renku.notion.site/How-to-migrate-out-of-RenkuLab-GitLab-2700df2efafc80c2b442c3ad981d86fc",
  RENKU_2_SUNSET: "https://blog.renkulab.io/sunsetting-legacy/",
  RENKU_2_CREATE_PROJECT:
    "https://www.notion.so/renku/How-to-create-a-new-project-eea72bea221848d7bd0b3338dd859504#eea72bea221848d7bd0b3338dd859504",
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

const RenkuContactEmail = "hello@renku.io";

export { Docs, GitlabLinks, Links, RenkuContactEmail, RenkuPythonDocs };
