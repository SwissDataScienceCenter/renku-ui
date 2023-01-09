import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";
import { BrowserRouter as Router } from "react-router-dom";
import * as reactRedux from "react-redux";
import { Provider } from "react-redux";

import App from "./App";
import { testClient as client } from "./api-client";
import { StateModel, globalSchema } from "./model";
import { generateFakeUser } from "./user/User.test";

describe("rendering", () => {
  const model = new StateModel(globalSchema);
  const params = { WELCOME_PAGE: "Some text", STATUSPAGE_ID: "5bce9beff4ca" };
  const fakeLocation = { pathname: "" };
  const useDispatchMock = jest.spyOn(reactRedux, "useDispatch");

  beforeEach(() => {
    useDispatchMock.mockClear();
  });

  it("renders anonymous user without crashing", async () => {
    const div = document.createElement("div");
    const user = generateFakeUser(true);
    const dummyDispatch = jest.fn();
    useDispatchMock.mockReturnValue(dummyDispatch);

    await act(async () => {
      ReactDOM.render(
        <Provider store={model.reduxStore}>
          <Router>
            <App client={client} model={model} user={user} location={fakeLocation} params={params} />
          </Router>
        </Provider>
        , div);
    });
  });

  it("renders logged user without crashing", async () => {
    const div = document.createElement("div");
    const user = generateFakeUser();
    await act(async () => {
      ReactDOM.render(
        <Provider store={model.reduxStore}>
          <Router>
            <App client={client} model={model} user={user} location={fakeLocation} params={params} />
          </Router>
        </Provider>
        , div);
    });
  });
});
