
/*!
 * Copyright 2017 - Swiss Data Science Center (SDSC)
 * A partnership between École Polytechnique Fédérale de Lausanne (EPFL) and
 * Eidgenössische Technische Hochschule Zürich (ETHZ).
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 *  incubator-renku-ui
 *
 *  UIState.js
 *  Utility UI state management.
 */

import { createStore as reduxCreateStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";

function createStore(reducer, name = "renku") {
  const composeEnhancers =
  typeof window === "object" &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Specify extension options like name, actionsBlacklist, actionsCreators, serialize...
      name,
      trace: true, traceLimit: 25
    }) : compose;

  const enhancer = composeEnhancers(
    applyMiddleware(thunk),
    // other store enhancers if any
  );
  return reduxCreateStore(reducer, enhancer);

}


// ! MOCK FROM THe OLD CODE
// import { websocketApi } from "../../features/websocket";
// function createStore(renkuStateModelReducer, name = "renku") {
//   // renkuStateModelReducer[websocketApi.reducerPath] = websocketApi.reducer;
//   // For the moment, disable the custom middleware, since it causes
//   // problems for our app.
//   const store = configureStore({
//     reducer: renkuStateModelReducer,
//     middleware: (getDefaultMiddleware) =>
//       getDefaultMiddleware({
//         immutableCheck: false,
//         serializableCheck: false,
//       }).concat(websocketApi.middleware),
//   });
//   return store;
// }

// TODO: Introduce a mock store for testing
// import configureMockStore from 'redux-mock-store'
// function createMockStore(reducer, name='renku') {
//   const mockStore = configureMockStore([thunk]);
//   return mockStore;
// }


export { createStore };
