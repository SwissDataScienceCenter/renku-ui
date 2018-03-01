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

import React from 'react'
import { Row, Col, Button, Input, TabContent, TabPane, NavItem,
  Nav, NavLink, DropdownMenu, DropdownItem, DropdownToggle, Dropdown} from 'reactstrap';
import classnames from 'classnames'

import { ContributionBody } from './render';
import patterns  from './patterns';
import { Avatar } from '../UIComponents'

const EDIT = 'edit';
const PREVIEW = 'preview';


export class NewContribution extends React.Component {
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
    this.getFiles('');
  }

  handleChange(e) {
    // We store the target value because it's not available anymore inside the
    // callback ('synthetic events')
    //let newBody = e.target.value.replace('{MARKUP}', '');
    let newBody = e.target.value;
    this.setState((prevState) => {
      let newContribution = {...prevState.contribution, body: newBody};
      return {...prevState, contribution: newContribution};
    });
    this.computeMentions(newBody);
  }

  toggle(tab) {
    if (this.state.tab !== tab) {
      this.setState({
        tab: tab
      });
    }
  }

  getFiles(searchPath){
    this.setState({loading: true});

    this.props.client.getRepositoryTree(this.props.projectId, searchPath)
      .then(results => {
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


  render() {
    const textInput = <span><Input
      type="textarea"
      id="newContributionBody"
      placeholder="Write a new contribution"
      value={this.state.contribution.body}
      onChange={this.handleChange.bind(this)}
    />
    <MentionsList mentions={this.state.mentions} clicked={mention => this.replaceMention(mention)}/>
    </span>;
    return <span>
      <Row className="contribution">
        <Col md={1}><Avatar/></Col>
        <Col md={9}>
          <Nav tabs>
            <NavItem>
              <NavLink
                className={classnames({ active: this.state.tab === EDIT })}
                onClick={() => { this.toggle(EDIT); }}
              >Edit</NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: this.state.tab === PREVIEW })}
                onClick={() => { this.toggle(PREVIEW); }}
              >Preview</NavLink>
            </NavItem>
          </Nav>

          <TabContent activeTab={this.state.tab}>
            <TabPane tabId={EDIT} className="py-2">{textInput}</TabPane>
            <TabPane tabId={PREVIEW} className="pt-2">
              {/*This might look silly, but I want to remove the preview from the virtual DOM when the user*/}
              {/*is typing rather than rerendering it on every keystroak when the user is typing.*/}
              {this.state.tab === PREVIEW ? <ContributionBody
                {...this.props} contribution={this.state.contribution}/> : null}
            </TabPane>
          </TabContent>
          <Button
            className="float-right"
            color="primary" onClick={() => {
              this.props.client.postContribution(this.props.projectId, this.props.kuIid, this.state.contribution.body);
              this.props.appendContribution(buildContribution(this.state, this.props));
            }}>Submit</Button>
        </Col>
      </Row>
    </span>

  }
}

class MentionsList extends React.Component {
  render() {
    return (
      <Dropdown isOpen={this.props.mentions.length > 0} toggle={()=>null}>
        <DropdownToggle tag="span"/>
        <DropdownMenu>
          {this.props.mentions.map(
            mention => <DropdownItem
              onClick={() => this.props.clicked(mention)}
              key={mention.refFilePath}
            >{mention.refFilePath}</DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>)
  }
}

function buildContribution(state, props){
  return {
    body: state.contribution.body,
    author: props.store.getState().user,
    created_at: (new Date()).toISOString(),
    updated_at: (new Date()).toISOString()
  }
}
