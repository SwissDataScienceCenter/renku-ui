# RTK Query Code Generation

This folder sets up the code to
[auto-generate RTK Query code](https://redux-toolkit.js.org/rtk-query/usage/code-generation#openapi)
starting from the OpenAPI schema definitions.

We plan to use this solution as an on-demand tool to generate types definitions or a basic structure rather than integrate it into our code base.

There are a few reasons for this; amongst others, only some backend specs are completely up-to-date or cover all the APIs we need. Also, handling versioning becomes more complicated.

We can revisit this later and decide to programmatically generate the code, at least for the backend services exposing all the APIs.

## How to use it

The configuration is written in the `openapi-config.ts` file in this folder
(/client/.rtk).

Open it, set the correct values for `targetDeployment` (usually `dev.renku.ch` or a CI deployment) and the `targetBackend` ( works for renku-core, renku-notebooks, and some APIs on renku-graph), then run the following command from the CLI:

    $ npx @rtk-query/codegen-openapi openapi-config.ts

It should generate a `<backend-name>Api.ts` file.

The content might be verbose in some cases (especially for renku-core) and can only sometimes be used right away. Use it at your own risk to copy-paste valuable parts.
