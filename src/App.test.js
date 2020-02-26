import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import { testClient as client } from "./api-client";
import { StateModel, globalSchema } from "./model";
import { generateFakeUser } from "./user/User.test";

describe("rendering", () => {
  const model = new StateModel(globalSchema);

  it("renders anonymous user without crashing", () => {
    const div = document.createElement("div");
    const user = generateFakeUser(true);
    ReactDOM.render(
      <App
        client={client}
        model={model}
        user={user}
        params={{ WELCOME_PAGE: "Some text" }} />
      , div);
  });

  it("renders logged user without crashing", () => {
    const div = document.createElement("div");
    const user = generateFakeUser();
    ReactDOM.render(
      <App
        client={client}
        model={model}
        user={user}
        params={{ WELCOME_PAGE: "Some text" }} />
      , div);
  });
});
