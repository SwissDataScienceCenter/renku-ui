/*!
 * Copyright 2018 - Swiss Data Science Center (SDSC)
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
import { faInfoCircle, faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { Button, Alert, Progress } from "reactstrap";

import { Loader, SuccessAlert, WarnAlert } from "../utils/UIComponents";
import { GraphIndexingStatus } from "../project/Project";

function KnowledgeGraphPrivateInfo(props) {
  if (!props.isPrivate) return null;
  return (
    <p className="font-italic small">
      This is a private project. Though contents remain private,
      the Knowledge Graph may make some metadata public. Only activate if that is acceptable.
      <br />
      <a href="https://renku.readthedocs.io/en/latest/user/knowledge-graph.html"
        target="_blank" rel="noopener noreferrer">
        <FontAwesomeIcon icon={faExternalLinkAlt} /> Read more about the Knowledge Graph integration.
      </a>
    </p>
  );
}

function KnowledgeGraphStatus(props) {
  const { error, progress, webhookJustCreated } = props;
  if (error != null) {
    return <WarnAlert>
      Knowledge Graph integration must be activated to view the lineage, but&nbsp;
      there is a problem with the knowledge graph integration for this project. To resolve this problem,
      you should contact the development team on&nbsp;
      <a href="https://gitter.im/SwissDataScienceCenter/renku"
        target="_blank" rel="noreferrer noopener">Gitter</a> or&nbsp;
      <a href="https://github.com/SwissDataScienceCenter/renku"
        target="_blank" rel="noreferrer noopener">GitHub</a>.
    </WarnAlert>;
  }
  if (progress == null) {
    return (
      <Loader />
    );
  }
  if (progress === GraphIndexingStatus.NO_WEBHOOK) {
    if (webhookJustCreated) {
      return (
        <WarnAlert>
          Knowledge Graph activated! Lineage computation starting soon...
        </WarnAlert>
      );
    }

    const action = props.maintainer ?
      <Button color="warning" onClick={props.createWebhook}>Activate</Button> :
      <span>You do not have sufficient rights, but a project owner can do this.</span>;

    return (
      <WarnAlert>
        {props.warningMessage ?
          props.warningMessage :
          "Knowledge Graph integration must be activated to view the lineage."}
        <br />
        <KnowledgeGraphPrivateInfo isPrivate={props.isPrivate} />
        <br />
        {action}
      </WarnAlert>
    );

  }
  else if (progress === GraphIndexingStatus.NO_PROGRESS) {
    let forkedInfo = null;
    if (props.forked) {
      forkedInfo = (
        <div>
          <br />
          <FontAwesomeIcon icon={faInfoCircle} /> <span className="font-italic">If you recently forked
            this project, the graph integration will not finish until you create at least one commit.
          </span>
        </div>
      );
    }
    return (
      <div>
        <Alert color="primary">
          Please wait, Knowledge Graph integration recently triggered.
          {forkedInfo}
        </Alert>
        <Loader />
      </div>
    );
  }
  else if (progress >= GraphIndexingStatus.MIN_VALUE && progress < GraphIndexingStatus.MAX_VALUE) {
    return (
      <div>
        <Alert color="primary">
          <p>Knowledge Graph is building... {parseInt(progress)}%</p>
          <Progress value={progress} />
        </Alert>
      </div>
    );
  }
  else if (props.displaySuccessMessage) {
    return <SuccessAlert>
      Knowledge Graph integration is active.
    </SuccessAlert>
    ;
  }

  return null;
}

export { KnowledgeGraphStatus };
