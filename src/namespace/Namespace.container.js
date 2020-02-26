/*!
 * Copyright 2020 - Swiss Data Science Center (SDSC)
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
 *  Namespace.container.js
 *  Namespace container components.
 */

import React, { useState, useEffect } from "react";

import { NamespaceProjectsPresent } from ".";
import { API_ERRORS } from "../api-client/errors";

const userModel = {
  data: null,
  fetching: false,
  fetched: false
};
const groupModel = { ...userModel };

/**
 * Verify if a namespace exists as a user or group and suggest a redirect
 *
 * @param {string} namespace - target namespace
 * @param {Object} client - api-client used to query the gateway
 */
const NamespaceProjects = (props) => {
  const [user, setUser] = useState(userModel);
  const [group, setGroup] = useState(groupModel);

  // fetch user and group data
  useEffect(() => {
    let aborted = false;
    setUser({ fetching: true });
    setGroup({ fetching: true });
    props.client.getGroupByPath(props.namespace)
      .catch(error => {
        if (error.case === API_ERRORS.notFoundError)
          return { data: {} };
        throw error;
      })
      .then(resp => {
        if (aborted)
          return;
        const { data } = resp;
        setGroup({
          data: data,
          fetching: false,
          fetched: new Date()
        });
      });
    props.client.getUserByPath(props.namespace)
      .then(resp => {
        if (aborted)
          return;

        const data = resp.data && resp.data.length ?
          resp.data[0] :
          {};
        setUser({
          data: data,
          fetching: false,
          fetched: new Date()
        });
      });

    const cleanup = () => { aborted = true; };
    return cleanup;
  }, [props.namespace, props.client]);

  return (
    <NamespaceProjectsPresent
      namespace={props.namespace}
      user={user}
      group={group}
    />
  );
};

export { NamespaceProjects };
