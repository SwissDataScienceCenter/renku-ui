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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

import { ErrorAlert, InfoAlert } from "../utils/components/Alert";
import LoginAlert from "../utils/components/loginAlert/LoginAlert";

/**
 *  incubator-renku-ui
 *
 *  DatasetError
 *  Components for show dataset error
 */

function DatasetError({ fetchError, insideProject, logged }) {
  const textPre = "You might need to be logged in to see this dataset. ";
  const textPost = "and try again.";

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
  if (fetchError.code === 404) {
    const info = logged ?
      (
        <InfoAlert timeout={0}>
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
        </InfoAlert>
      ) :
      (<LoginAlert logged={logged} textPost={textPost} textPre={textPre} />);
    errorDetails = (
      <div>
        <h3 data-cy="dataset-error-title">Dataset not found <FontAwesomeIcon icon={faSearch} flip="horizontal" /></h3>
        <div>&nbsp;</div>
        <p>
          It is possible that the dataset has been deleted by its owner or you do not have permission
          to access it.
        </p>
        {info}
      </div>
    );
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
