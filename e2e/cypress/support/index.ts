// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import "./authentication/gui_commands";
import { User } from "./authentication/user.interfaces";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      gui_kc_login(user: User, startFromHome: boolean): void,
      gui_kc_register(user: User): void,
      gui_is_welcome_page_logged_user(username: string): void,
      gui_logout(): void
    }
  }
}

Cypress.on("uncaught:exception", () => {
  // returning false here prevents Cypress from failing the test
  return false;
});
