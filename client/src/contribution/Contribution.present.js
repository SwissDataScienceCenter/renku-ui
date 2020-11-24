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

import React from "react";
import {
  Row, Col, Button, Input, TabContent, TabPane, NavItem,
  Nav, NavLink, DropdownMenu, DropdownItem, DropdownToggle, Dropdown
} from "reactstrap";
import classnames from "classnames";

import { UserAvatar, TimeCaption, RenkuMarkdown } from "../utils/UIComponents";
import { EDIT, PREVIEW } from "./Contribution.constants";
import { Card, CardHeader, CardBody } from "reactstrap";

/**
 * Contribution
 *
 * @param contribution - the actual contribution to display
 * @param client - an api client instance
 * @param projectId - id of the current project
 */
class Contribution extends React.Component {
  render() {
    const contribution = this.props.contribution;

    return <div>
      <br />
      <Row>
        <Col key="image" md={1} sm={1} className="float-right text-center" style={{ maxWidth: "62px" }}>
          <UserAvatar size="lg" person={contribution.author} />
        </Col>
        <Col key="body" md={10} sm={10} className="float-left">
          <Card className="triangle-border left">
            <CardHeader icon="success" className="bg-transparent align-items-baseline">
              <Row>
                <Col md={12}>
                  <strong>{contribution.author ? contribution.author.name : null}</strong>&nbsp;&nbsp;
                  <span className="caption align-baseline">
                    <TimeCaption key="timeCaption" caption="Commented" time={contribution.updated_at} />
                  </span>
                </Col>
              </Row>
            </CardHeader>
            <CardBody className="mb-0 pb-0">
              <div className="pb-3">
                <RenkuMarkdown
                  projectPathWithNamespace={this.props.projectPathWithNamespace}
                  filePath={""}
                  fixRelativePaths={true}
                  markdownText={contribution.body ?
                    contribution.body :
                    contribution.note}
                  client={this.props.client}
                  projectId={this.props.projectId}
                />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>;
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
      <Col md={1} sm={1} style={{ maxWidth: "62px", minWidth: "62px" }}></Col>
      <Col md={10} sm={10}>
        <div className="margin-no-triangle">
          <Nav pills className={"nav-pills-underline"}>
            <NavItem>
              <NavLink
                className={classnames({ active: props.tab === EDIT })}
                onClick={() => {
                  props.onTabClick(EDIT);
                }}
              >Write</NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: props.tab === PREVIEW })}
                onClick={() => {
                  props.onTabClick(PREVIEW);
                }}
              >Preview</NavLink>
            </NavItem>
          </Nav>

          <TabContent activeTab={props.tab}>
            <TabPane tabId={EDIT} className="py-2">{textInput}</TabPane>
            <TabPane tabId={PREVIEW} className="pt-2">
              {/*This might look silly, but I want to remove the preview from the virtual DOM when the user*/}
              {/*is editing rather than re-rendering it on every keystroke while the user is typing.*/}
              {props.tab === PREVIEW ?
                <div className="pb-3">
                  <RenkuMarkdown
                    projectPathWithNamespace={props.projectPathWithNamespace}
                    filePath={""}
                    fixRelativePaths={true}
                    markdownText={props.contribution.body}
                    client={props.client}
                    projectId={props.projectId}
                  />
                </div>
                : null}
            </TabPane>
          </TabContent>
          <Button
            className="float-right"
            color="primary"
            onClick={props.onSubmit}
            disabled={props.submitting}
          >Submit</Button>
        </div>
      </Col>
    </Row>
  </span>;
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

export { Contribution, NewContribution };
