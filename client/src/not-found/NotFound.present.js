/*!
 * Copyright 2019 - Swiss Data Science Center (SDSC)
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
 *  renku-ui
 *
 *  NotFound.present.js
 *  Presentational components for not-found
 */

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import "./NotFound.css";

const NotFound = (props) => {
  const title = props.title ?? "Page not found";
  const description = props.description ?? "We cannot seem to find the page you are looking for, sorry!";
  return (
    <div className="not-found-box">
      <div className="container-xxl pt-5 renku-container">
        <div className="not-found-box-text">
          <h1 className="title">404</h1>
          <h3 className="subtitle">{title}</h3>
          <p>{description}</p>
          <div className="mt-5">
            <Link to="/">
              <Button className="btn-rk-green btn-icon-text">
                <FontAwesomeIcon icon={faHome} /> Return Home
              </Button>
            </Link>
          </div>
        </div>
        {props.children == null ? null : <div className="not-found-box-text mt-4">{props.children}</div>}
      </div>
    </div>
  );
};

export { NotFound };
