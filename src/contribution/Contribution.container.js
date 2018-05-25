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

import React from 'react';

import { ContributionBody as ContributionBodyPresent,
  NewContribution as NewContributionPresent } from './Contribution.present';
import { EDIT, patterns } from './Contribution.constants'


class ContributionBody extends React.Component {
  constructor(props) {
    super(props);
    this._mounted = false;
    const blocks = matchRefs(this.props.contribution.body);
    this.state = {blocks};
  }

  componentDidMount() {
    this._mounted = true;
    const blocks = this.state.blocks;
    this.fetchRefs(blocks);
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  // Fetch all the references and add them to the app-state.
  fetchRefs(blocks) {
    blocks.forEach(block => {
      if (block.type === 'fileRef') {
        this.props.client.getRepositoryFile(this.props.projectId, block.refPath, 'master', 'base64')
          .then(d => {this.modifyBlock(block.iBlock, 'data', d)});
      }
    });
  }

  // Safe way of setting a property of a given block to a certain value and put it to app-state.
  modifyBlock(iBlock, property, value) {
    let blocks = [...this.state.blocks];
    let updateBlock = {...blocks[iBlock]};
    updateBlock[property] = value;
    blocks[iBlock] = updateBlock;
    if (this._mounted) this.setState({blocks})
  }

  render() {
    return <ContributionBodyPresent
      {...this.props}
      blocks={this.state.blocks}
      onReferenceClick={iBlock => this.modifyBlock(iBlock, 'isOpened', !this.state.blocks[iBlock].isOpened)}
    />
  }
}


// Match all references to files in the repo and turn
// the body into blocks of either simple text or references.
function matchRefs(contributionText) {

  let blocks = [];
  let blockCounter = 0;
  let match, previousMatch = {
    0: '',
    index: 0
  };
  while ((match = patterns.fileRefFull.exec(contributionText)) !== null){
    const isOpened = match[0][0] === '!';
    const refText = match[1];
    const refPath = match[2];

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


class NewContribution extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: EDIT,
      contribution: {
        body: ''
      },
      files: [],
      loading: false,
      mentions: [],
      currentSearchPath: null
    };
  }

  // We must launch this operation as early as possible but only
  // after the component has been mounted (setting state on non-mounted component
  // is not possible).
  componentDidMount() {
    this.abortPromise = false;
    this.getFiles('');
  }

  // We have to prevent state changes in the callback of an async call in cases
  // where the component has unmounted in the mean time.
  componentWillUnmount() {
    this.abortPromise = true;
  }

  handleChange(e) {
    // We store the target value because it's not available anymore inside the
    // callback ('synthetic events')
    let newBody = e.target.value;
    this.setState((prevState) => {
      let newContribution = {...prevState.contribution, body: newBody};
      return {...prevState, contribution: newContribution};
    });
    this.computeMentions(newBody);
  }

  toggleTab(tab) {
    if (this.state.tab !== tab) {
      this.setState({
        tab: tab
      });
    }
  }

  getFiles(searchPath){
    this.setState({loading: true});

    this.props.client.getRepositoryTree(this.props.projectId, {path: searchPath})
      .then(results => {
        if (!this.abortPromise) {
          this.setState({files: results.map(file => {
            let filePath = file.path;
            if (file.type === 'tree') {
              filePath += '/';
            }
            return filePath
          })});
          this.setState({loading: false});
          this.setState({currentSearchPath: searchPath});
          this.computeMentions(this.state.contribution.body);
        }
      })
  }

  computeMentions(body) {
    const match = patterns.fileRefTrigger.exec(body)

    if (!match) {
      this.setState({mentions: []});
      return;
    }

    const refName = match[1];
    const queryString = match[2];

    const pathRegex = /.*\//;
    const searchPathMatch = pathRegex.exec(queryString);
    const searchPath = searchPathMatch ? searchPathMatch[0] : '';

    if (searchPath !== this.state.currentSearchPath) {
      this.getFiles(searchPath)
    }

    this.setState({
      mentions:
        this.state.files
          .filter(path => path.includes(queryString))
          .map(file => ({
            type: 'fileRef',
            refName: refName,
            refFilePath: file
          }))
    })
  }

  replaceMention(selectedObject) {
    // Note that there is always a match here, otherwise there's something wrong.
    const match = patterns.fileRefTrigger.exec(this.state.contribution.body)[0];

    let replaceString = `${selectedObject.refName}(${selectedObject.refFilePath}`;
    if (replaceString.slice(-1) !== '/') replaceString += ')';

    const newBody = this.state.contribution.body.replace(match, replaceString);
    this.setState({contribution: {
      body: newBody
    }});
    this.computeMentions(newBody);
  }

  onSubmit(){
    this.props.client.postContribution(this.props.projectId, this.props.kuIid, this.state.contribution.body);
    this.props.appendContribution(buildContribution(this.state, this.props));
  }

  render() {
    return <NewContributionPresent
      contribution={this.state.contribution}
      mentions={this.state.mentions}
      tab={this.state.tab}
      onBodyChange={this.handleChange.bind(this)}
      onTabClick={this.toggleTab.bind(this)}
      onMentionClick={this.replaceMention.bind(this)}
      onSubmit={this.onSubmit.bind(this)}
      client={this.props.client}
      projectId={this.props.projectId}
    />
  }
}

function buildContribution(state, props){
  return {
    body: state.contribution.body,
    author: props.userState.getState().user,
    created_at: (new Date()).toISOString(),
    updated_at: (new Date()).toISOString()
  }
}

export { ContributionBody, NewContribution }
