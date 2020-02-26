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
 *  Namespace.present.js
 *  Namespace presentational components.
 */

import React from "react";
import { Link } from "react-router-dom";
import { Row, Col, Container } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

import { Loader, InfoAlert, ExternalLink } from "../utils/UIComponents";

const NamespaceProjects = (props) => {
  const { namespace } = props;
  // TODO: I should get the URLs from the redux store: #779
  const searchUrl = "/projects/search";
  const searchProjectUrl = (project) => { return `${searchUrl}?q=${project}`; };
  const searchUserUrl = (user) => { return `${searchUrl}?searchIn=users&q=${user}`; };
  const searchGroupUrl = (group) => { return `${searchUrl}?searchIn=groups&q=${group}`; };

  let checking = null;
  if (props.user.fetching || props.group.fetching) {
checking = (<div>
  <p>Searching for {namespace}...</p>
  <Loader />
</div>);
}

  let outcome = null;
  let userOrGroup = "";
  if (checking == null) {
    if (props.user.fetched && props.user.data.id) {
      userOrGroup = "User";
      const projectsUrl = searchUserUrl(props.user.data.username);
      const gitlabUrl = props.user.data.web_url;
      outcome = (
        <NamespaceUserActions namespace={namespace} projectsUrl={projectsUrl} gitlabUrl={gitlabUrl} />
      );
    }
    else if (props.group.fetched && props.group.data.id) {
      userOrGroup = "Group";
      const projectsUrl = searchGroupUrl(props.group.data.full_path);
      const gitlabUrl = props.group.data.web_url;
      outcome = (
        <NamespaceGroupActions namespace={namespace} projectsUrl={projectsUrl} gitlabUrl={gitlabUrl} />
      );
    }
    else {
      const userUrl = searchUserUrl(namespace);
      const groupUrl = searchGroupUrl(namespace);
      const projectUrl = searchProjectUrl(namespace);
      outcome = (
        <NamespaceNotfoundActions namespace={namespace} userUrl={userUrl} groupUrl={groupUrl} projectUrl={projectUrl} />
      );
    }
  }

  return (
    <Container fluid>
      <Row>
        <Col>
          <h3>{userOrGroup} {props.namespace}</h3>
          <div>&nbsp;</div>
          {checking}
          {outcome}
        </Col>
      </Row>
    </Container>
  );
};

const NamespaceUserActions = (props) => {
  return (<div>
    <p>What would you like to do?</p>
    <ul className="mb-0">
      <li className="mb-1">
        Browse user&apos;s <Link
          className="btn btn-primary btn-sm" role="button" to={props.projectsUrl}>projects
        </Link>
      </li>
      <li>
        Visit user&apos;s <ExternalLink url={props.gitlabUrl} size="sm" title="GitLab page" />
      </li>
    </ul>
  </div>);
};

const NamespaceGroupActions = (props) => {
  return (<div>
    <p>What would you like to do?</p>
    <ul className="mb-0">
      <li className="mb-1">
        Browse group&apos;s <Link
          className="btn btn-primary btn-sm" role="button" to={props.projectsUrl}>projects
        </Link>
      </li>
      <li>
        Visit group&apos;s <ExternalLink url={props.gitlabUrl} size="sm" title="GitLab page" />
      </li>
    </ul>
  </div>);
};

const NamespaceNotfoundActions = (props) => {
  return (<div>
    <p>We could not find a user or group with name <i>{props.namespace}</i>.</p>

    <InfoAlert timeout={0}>
      <p>
        <FontAwesomeIcon icon={faInfoCircle} /> If you know what you were looking for, you can try
        using our search feature.
      </p>
      <p>
        I was looking for...
      </p>
      <div>
        <Link className="btn btn-primary btn-sm mr-1" role="button" to={props.projectUrl}>A project</Link>
        <Link className="btn btn-primary btn-sm mr-1" role="button" to={props.userUrl}>A user</Link>
        <Link className="btn btn-primary btn-sm mr-1" role="button" to={props.groupUrl}>A group</Link>
      </div>
    </InfoAlert>
  </div>);
};

export { NamespaceProjects };
