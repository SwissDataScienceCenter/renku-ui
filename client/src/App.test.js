import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";

import App from "./App";
import { testClient as client } from "./api-client";
import { StateModel, globalSchema } from "./model";
import { generateFakeUser } from "./user/User.test";

describe("rendering", () => {
  const model = new StateModel(globalSchema);
  const params = { WELCOME_PAGE: "Some text", STATUSPAGE_ID: "5bce9beff4ca" };
  const fakeLocation = { pathname: "" };

  it("renders anonymous user without crashing", () => {
    const div = document.createElement("div");
    const user = generateFakeUser(true);
    ReactDOM.render(
      <Router>
        <App client={client} model={model} user={user} location={fakeLocation} params={params} />
      </Router>
      , div);
  });

  it("renders logged user without crashing", () => {
    const div = document.createElement("div");
    const user = generateFakeUser();
    ReactDOM.render(
      <Router>
        <App client={client} model={model} user={user} location={fakeLocation} params={params} />
      </Router>
      , div);
  });
});
