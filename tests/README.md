# E2E Tests for Renku UI

End-to-end tests are Cypress-based UI tests that rely on a local instance of the UI.
All the APIs are mocked using JSON files from the `fixtures` folder. Therefore, these tests
can run completely in isolation.

Mind that the UI is run from the `../client` folder, so you need to setup the client properly
before running the e2e tests.


## Run the tests

### Build the client (optional)

_If you already installed the dependencies in the `../client` folder, this step is not necessary._

Install the client:

```
> npm run build-client
```

Mind that this operation is equivalent to `npm run install` in the `../client` folder. It
requires some time, up to a few minutes depending on your machine.

### Install e2e depencendices

Install the necessary dependencies:

```
npm install
```

### Run the e2e tests

There are a few ways to run the end-to-end tests, depending on your goal.

If you plan to visualize the tests on the browser, or you are adding/changing a test, you
can start using the following command to serve the UI client content and load the tests
interactively on your browser:

```
npm run e2e
```

If you prefer running your tests in bulk, you can use the `:headless` version. The
following command will start serving the UI client content and run the tests reporting the
output directly in the CLI without opening the browser.

```
npm run e2e:headless
```

If you prefer to run the UI client in a different way (perhaps starting it separately from the
`../client` folder) differently, or you prefer to run tests against a live deployment, you can
use either `npm run cypress` or `npm run cypress:headless`. Remember to provide a valid URL as
`e2e.baseUrl` in case you need something different than `"http://localhost:3000"`


## Opening Cypress GUI
```
npm run e2e:headless
```

### Other links
Here are some additional resources:

* Debugging: https://docs.cypress.io/guides/guides/debugging#Using-debugger
* Best practices: https://docs.cypress.io/guides/references/best-practices
* Online dashboard: https://dashboard.cypress.io/projects/2nbsft
