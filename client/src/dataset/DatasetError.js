/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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
import React from "react";
import { Link, useLocation } from "react-router-dom";

import { ErrorAlert } from "../utils/components/Alert";
import LoginAlert from "../utils/components/loginAlert/LoginAlert";
import NotFound from "../not-found";
import { Url } from "../utils/helpers/url";

/**
 *  incubator-renku-ui
 *
 *  DatasetError
 *  Components for show dataset error
 */

function DatasetError({ fetchError, insideProject, logged }) {
  const textPre = "You might need to be logged in to see this dataset. ";
  const textPost = "and try again.";
  const location = useLocation();
  const loginUrl = Url.get(Url.pages.login.link, { pathname: location.pathname });

  // inside project case
  if (insideProject) {
    const title = `Error ${fetchError.code ? fetchError.code : "unknown"}`;
    let errorDetails = null;
    if (fetchError.code === 404) {
      errorDetails = (
        <p>We could not find the dataset. It is possible it has been deleted by its owner.</p>
      );
    }
    else if (fetchError.message) {
      errorDetails = (<p>Error details: {fetchError.message}</p>);
    }
    const tip = logged ?
      (<p className="mb-0">You can try to select a dataset again from the list in the previous page.</p>) :
      (<LoginAlert logged={logged} textPost={textPost} textPre={textPre} />);

    return (
      <ErrorAlert>
        <h5>{title}</h5>
        {errorDetails}
        {tip}
      </ErrorAlert>
    );
  }

  // global page case
  let errorDetails = null;
  // eslint-disable-next-line max-len
  const errorDesc = "It is possible that the dataset has been deleted by its owner or you do not have permission to access it.";
  if (fetchError.code === 404) {
    const info = logged ?
      (
        <>
          <p>
            If you are sure the dataset exists,
            you may want to try the following:
          </p>
          <ul className="mb-0">
            <li>Do you have multiple accounts? Are you logged in with the right user?</li>
            <li>
              If you received this link from someone, ask that person to make sure you have access to the dataset.
            </li>
          </ul>
        </>
      ) :
      (<p>{textPre}<Link className="btn btn-secondary btn-sm mx-2" to={loginUrl}>Log in</Link>{textPost}</p>);
    errorDetails = (
      <NotFound
        title="Dataset not found"
        description={errorDesc}>
        {info}
      </NotFound>
    );
    return errorDetails;
  }
  else if (fetchError.message) {
    errorDetails = (<p>Error details: {fetchError.message}</p>);
  }

  return (
    <div>
      <h1>Error {fetchError.code ? fetchError.code : "unknown"}</h1>
      {errorDetails}
    </div>
  );
}

export { DatasetError };
