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

import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import {Button, Alert, Progress } from 'reactstrap';

import { Loader } from '../utils/UIComponents';
import { GraphIndexingStatus } from '../project/Project';

function KnowledgeGraphStatus(props) {
  const {error, progress, webhookJustCreated} = props;
  if (error != null) {
    return <Alert color="warning">
      Knowledge Graph integration must be activated to view the lineage and the datasets, but&nbsp;
      there is a problem with the knowledge graph integration for this project. To resolve this problem,
      you should contact the development team on&nbsp;
      <a href="https://gitter.im/SwissDataScienceCenter/renku" target="_blank" rel="noreferrer noopener">Gitter</a> or&nbsp;
      <a href="https://github.com/SwissDataScienceCenter/renku" target="_blank" rel="noreferrer noopener">GitHub</a>.
    </Alert>
  }
  if (progress == null) {
    return (
      <Loader />
    )
  }
  if (progress === GraphIndexingStatus.NO_WEBHOOK) {
    if (webhookJustCreated) {
      return (
        <Alert color="warning">
          Knowledge Graph activated! Lineage computation starting soon...
        </Alert>
      )
    }
    else {
      const action = props.maintainer ?
        <Button color="warning" onClick={props.createWebhook}>Activate Knowledge Graph</Button> :
        <span>You do not have sufficient rights, but a project owner can do this.</span>

      return (
        <Alert color="warning">
          Knowledge Graph integration must be activated to view the lineage and the datasets.&nbsp;
          {action}
        </Alert>
      )
    }
  }
  else if (progress === GraphIndexingStatus.NO_PROGRESS) {
    let forkedInfo = null;
    if (props.forked) {
      forkedInfo = (
        <div>
          <br />
          <FontAwesomeIcon icon={faInfoCircle} /> <span className="font-italic">If you recenty forked
          this project, the graph integration will not finish until you create at least one commit.
          </span>
        </div>
      );
    }
    return (
      <div>
        <Alert color="primary">
          { props.insideDatasets ?
            <p><strong>Knowledge Graph integration is needed to be able to see the datasets.</strong></p>
            : null
          }
          Please wait, Knowledge Graph integration recently triggered.
          {forkedInfo}
        </Alert>
        <Loader />
      </div>
    )
  }
  else if (progress >= GraphIndexingStatus.MIN_VALUE && progress < GraphIndexingStatus.MAX_VALUE) {
    return (
      <div>
        <Alert color="primary">
          { props.insideDatasets ?
            <p><strong>Knowledge Graph integration is needed to be able to see the datasets.</strong></p>
            : null
          }
          <p>Knowledge Graph is building... {parseInt(progress)}%</p>
          <Progress value={progress} />
        </Alert>
      </div>
    )
  } else return null;
}

export { KnowledgeGraphStatus };
