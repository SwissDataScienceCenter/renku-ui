# E2E Tests for Renku UI

The `e2e` folder implements two kinds of Cypress-based UI tests. The first kind, which are in the `cypress/integration/live` folder, run against a live instance of RenkuLab (such as https://dev.renku.ch). These are useful for testing the end-to-end behavior of an actual running system.

The second kind, which are in the `cypress/integration/local` folder, run against a UI running on `localhost` and use mocked data. These are designed to test components, isolated, in a variety of situations.

Quickstart: Live
----------------

The e2e live tests depend on a running instance of Renku being present.

Once you have a development instance of Renku running locally or in the cloud, set the baseUrl and a valid user data (`env.USER`) in the `cypress.json` file.

**Note:** The user should also exist in dev.renku.ch

````
"baseUrl": "https://<my-namespace>.dev.renku.ch/"
"env": {
    "USER": {
      "firstname": "<firstname>",
      "lastname": "<lastname>",
      "email": "<email>",
      "password": "<password>"
    }
}
````

**Note:** For CI purposes the user data is saved as secret with key CYPRESS_USER
**Note:** The `USER` configuration can be put in `cypress.env.json`, which is in `.gitignore`, so you do not need to worry about accidentally pushing passwords to the Git server.


## Installation
````
## install al dependencies from e2e directory
npm install
````

## Opening Cypress GUI
````
npm run e2e
````


## Running the local tests
````
npm run e2e:local
````

This will start the RenkuLab UI locally and open the Cypress GUI.

## Running from the CLI
````
# run Cypress tests headlessly
npm run e2e:headless

### runs all example projects in specific browser
### similar to cypress run --browser <name>
npm run e2e:run --browser chrome

### sends test results, videos, screenshots
### to Cypress dashboard
npm run e2e:run --record
````

##  Run Lint
````
$ npm run lint
````

## Cypress dashboard

https://dashboard.cypress.io/projects/2nbsft

Access with e-mail (ask for credentials to Renku UI team)


### Other links
- Debugging: https://docs.cypress.io/guides/guides/debugging#Using-debugger
- Best practices: https://docs.cypress.io/guides/references/best-practices
