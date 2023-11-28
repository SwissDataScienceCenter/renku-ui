import { createRoot } from "react-dom/client";
import { act } from "react-dom/test-utils";
import * as reactRedux from "react-redux";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { vi } from "vitest";

import App from "./App";
import { testClient as client } from "./api-client";
import { StateModel, globalSchema } from "./model";
import { generateFakeUser } from "./user/User.test";
import { createCoreApiVersionedUrlConfig } from "./utils/helpers/url";

describe("rendering", () => {
  const model = new StateModel(globalSchema);
  const params = { WELCOME_PAGE: "Some text", STATUSPAGE_ID: "5bce9beff4ca" };
  const fakeLocation = { pathname: "" };
  const useDispatchMock = vi.spyOn(reactRedux, "useDispatch");

  beforeEach(() => {
    useDispatchMock.mockClear();
  });

  it("renders anonymous user without crashing", async () => {
    const div = document.createElement("div");
    const root = createRoot(div);
    const user = generateFakeUser(true);
    const dummyDispatch = vi.fn();
    useDispatchMock.mockReturnValue(dummyDispatch);

    await act(async () => {
      root.render(
        <Provider store={model.reduxStore}>
          <Router>
            <App
              client={client}
              model={model}
              user={user}
              location={fakeLocation}
              params={params}
            />
          </Router>
        </Provider>
      );
    });
  });

  it("renders logged user without crashing", async () => {
    const div = document.createElement("div");
    const root = createRoot(div);
    const user = generateFakeUser();
    const coreApiVersionedUrlConfig = createCoreApiVersionedUrlConfig({
      coreApiVersion: "/",
    });
    await act(async () => {
      root.render(
        <Provider store={model.reduxStore}>
          <Router>
            <App
              client={client}
              coreApiVersionedUrlConfig={coreApiVersionedUrlConfig}
              model={model}
              user={user}
              location={fakeLocation}
              params={params}
            />
          </Router>
        </Provider>
      );
    });
  });
});
