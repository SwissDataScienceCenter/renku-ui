# RTK Query Code Generation

This folders sets up the code to
[auto-generate RTK Query code](https://redux-toolkit.js.org/rtk-query/usage/code-generation#openapi)
starting from the the OpenAPI schema definitions.

It works for renku-core, renku-graph, renku-notebooks.

## How to use it

The configuration is written in the `openapi-config.ts` file in this folder.
Open it, set the correct values for `targetDeplyoment` and `targetBackend`,
then run the following command from the CLI:

    $ npx @rtk-query/codegen-openapi openapi-config.ts

It should generate a `<something>Api.ts` file.

The content is verbose (especially for renku-core 😱) and can't be usually used
right away. Stilly, its very useful to generate a basic structure and to create
the type definitions.
