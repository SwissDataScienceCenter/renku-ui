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
import { Row, Col, Button, Input, TabContent, TabPane, NavItem,
  Nav, NavLink, DropdownMenu, DropdownItem, DropdownToggle, Dropdown} from 'reactstrap';
import classnames from 'classnames';
import Collapse from 'react-collapse';

import { Avatar, TimeCaption } from '../utils/UIComponents'
import { FilePreview } from '../file';
import { ContributionBody as ContributionBodyContainer } from './Contribution.container';
import { EDIT, PREVIEW } from './Contribution.constants';


class Contribution extends React.Component {

  // Needed props:
  //  - contribution: the actual contribution to display
  //  - client: an api client instance
  //  - projectId: id of the current project

  render() {
    const contribution = this.props.contribution;
    return (
      <Row className="contribution">
        <Col md={1}><Avatar person={contribution.author} /></Col>
        <Col md={9}>
          <b>{contribution.author.name} </b>
          <TimeCaption caption="Updated" time={contribution.updated_at} />
          <ContributionBodyContainer {...this.props} />
        </Col>
      </Row>
    );
  }
}

// Parameters defining the opening/closing of react-collapse reference inlining.
const STIFFNESS = 290;
const DAMPING = 20;

class ContributionBody extends React.Component {

  // Needed props:
  //  - blocks: array of blocks (parsed contribution body). A block can be piece of text
  //            or a reference.
  //  - onReferenceClick:

  // Render the blocks. After putting the rendered blocks together,
  // this will be the entire body of the contribution
  renderBlocks() {
    return this.props.blocks.map(block => {
      if (block.type === 'fileRef') {
        return (
          <span key={block.iBlock}>
            <input
              type="button"
              className="text-link"
              value={block.refText}
              onClick={() => this.props.onReferenceClick(block.iBlock)}
            />
            <Collapse isOpened={block.isOpened}>
              <div className="expanded-reference">
                <FilePreview
                  file={block.data}
                  {...this.props}
                  springConfig={{STIFFNESS, DAMPING}}
                />
              </div>
            </Collapse>
          </span>);
      }
      return <p key={block.iBlock} className="comment-block">{block.text}</p> ;
    });
  }

  render() {
    return (
      <div className="pb-3">
        {this.renderBlocks()}
      </div>
    );
  }
}


const NewContribution = props => {

  const textInput =
    <span>
      <Input
        type="textarea"
        id="newContributionBody"
        placeholder="Write a new contribution"
        value={props.contribution.body}
        onChange={(e) => props.onBodyChange(e)}
      />
      <MentionsList mentions={props.mentions} clicked={props.onMentionClick}/>
    </span>;

  return <span>
    <Row className="contribution">
      <Col md={10}>
        <Nav pills className={'nav-pills-underline'}>
          <NavItem>
            <NavLink
              className={classnames({active: props.tab === EDIT})}
              onClick={() => {
                props.onTabClick(EDIT)
              }}
            >Write</NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({active: props.tab === PREVIEW})}
              onClick={() => {
                props.onTabClick(PREVIEW)
              }}
            >Preview</NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={props.tab}>
          <TabPane tabId={EDIT} className="py-2">{textInput}</TabPane>
          <TabPane tabId={PREVIEW} className="pt-2">
            {/*This might look silly, but I want to remove the preview from the virtual DOM when the user*/}
            {/*is editing rather than re-rendering it on every keystroak while the user is typing.*/}
            {props.tab === PREVIEW ? <ContributionBodyContainer {...props} /> : null}
          </TabPane>
        </TabContent>
        <Button
          className="float-right"
          color="primary" onClick={props.onSubmit}>Submit</Button>
      </Col>
    </Row>
  </span>
};


const MentionsList = props =>
  <Dropdown isOpen={props.mentions.length > 0} toggle={()=>null}>
    <DropdownToggle tag="span"/>
    <DropdownMenu>
      {props.mentions.map(
        mention => <DropdownItem
          onClick={() => props.clicked(mention)}
          key={mention.refFilePath}
        >{mention.refFilePath}</DropdownItem>
      )}
    </DropdownMenu>
  </Dropdown>;

export { Contribution, ContributionBody, NewContribution }
