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
 *  incubator-renga-ui
 *
 *  Contribution.js
 *  Module to display contributions nicely.
 */

import React from 'react';
import { Row, Col } from 'reactstrap';
import Collapse from 'react-collapse';

import { Avatar, TimeCaption } from '../UIComponents'
import { FilePreview } from '../file';


const STIFFNESS = 290;
const DAMPING = 20;

export class Contribution extends React.Component {
  constructor(props) {
    super(props);
    const blocks = matchRefs(this.props.contribution.body);
    this.state = {blocks};
    this.fetchRefs(blocks);
  }

  // Fetch all the references and add them to the state.
  fetchRefs(blocks) {
    blocks.forEach(block => {
      if (block.type === 'fileRef') {
        this.props.client.getRepositoryFile(this.props.projectId, block.refPath, 'master', 'base64')
          .then(d => {this.modifyBlock(block.iBlock, 'data', d)});
      }
    });
  }

  // Safe way of setting a property of a given block to a certain value and put it to state.
  modifyBlock(iBlock, property, value) {
    let blocks = [...this.state.blocks];
    let updateBlock = {...blocks[iBlock]};
    updateBlock[property] = value;
    blocks[iBlock] = updateBlock;
    this.setState({blocks})
  }

  // Render the blocks. After putting the rendered blocks together,
  // this will be the entire body of the contribution
  renderBlocks() {
    return this.state.blocks.map(block => {
      if (block.type === 'fileRef') {
        return (
          <span key={block.iBlock}>
            <input
              type="button"
              className="text-link"
              value={block.refText}
              onClick={() => this.modifyBlock(block.iBlock, 'isOpened', !block.isOpened)}
            />
            <Collapse isOpened={block.isOpened}>
              <div className="expanded-reference">
                <FilePreview file={block.data} springConfig={{STIFFNESS, DAMPING}}/>
              </div>
            </Collapse>
          </span>);
      }
      return <p key={block.iBlock} className="comment-block">{block.text}</p> ;
    });
  }

  render() {
    return (
      <div>
        <Row className="contribution">
          <Col md={1}><Avatar/></Col>
          <Col md={9}>
            <p>
              <b>{this.props.contribution.author.username}   </b>
              <TimeCaption caption="Updated" time={this.props.contribution.updated_at} />
            </p>
            {this.renderBlocks()}
          </Col>
        </Row>
      </div>
    );
  }
}


// Match all references to files in the repo
// ![display](path/to/repository/file) and turn
// the body into blocks of either simple text or
// references.

function matchRefs(contributionText) {

  let blocks = [];
  const refRegex = /!?\[(.*?)]\(.*?\)/g;

  let blockCounter = 0;
  let match, previousMatch = {
    0: '',
    index: 0
  };
  while ((match = refRegex.exec(contributionText)) !== null){
    const isOpened = match[0][0] === '!';
    const refText = match[0].match(/\[(.*)]/)[0].slice(1, -1);
    const refPath = match[0].match(/\((.*)\)/)[0].slice(1, -1);

    blocks.push({
      type: 'text',
      text: contributionText.slice(previousMatch.index + previousMatch[0].length, match.index),
      iBlock: blockCounter
    });
    blockCounter++;
    
    blocks.push({
      type: 'fileRef',
      refPath: refPath,
      refText: refText,
      isOpened: isOpened,
      data: null,
      iBlock: blockCounter
    });
    blockCounter++;
    previousMatch = match;
  }
  // Let's finish up by adding the last text block (after any reference) if there is any.
  if (previousMatch.index + previousMatch[0].length < contributionText.length) {
    blocks.push({
      type: 'text',
      text: contributionText.slice(previousMatch.index + previousMatch[0].length,
        contributionText.length),
      iBlock: blockCounter
    });
  }
  return blocks;
}
