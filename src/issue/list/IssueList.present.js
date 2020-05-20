
import React, { Component } from "react";
import { Link, NavLink } from "react-router-dom";
import { Row, Col, Badge, ListGroup, ListGroupItem, Nav, NavItem, NavLink as ReactNavLink } from "reactstrap";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { UserAvatar, RenkuMarkdown, TimeCaption, Pagination, Loader } from "../../utils/UIComponents";
import { issuesStateMap } from "./IssueList.container";

function issueStateBadge(issueStateValue) {
  let issueState = <Badge color="secondary">{issueStateValue}</Badge>;
  if (issueStateValue === issuesStateMap.OPENED)
    issueState = <Badge color="success">open</Badge>;
  if (issueStateValue === issuesStateMap.CLOSED)
    issueState = <Badge color="primary">complete</Badge>;
  return issueState;
}

class IssueListRow extends Component {
  render() {
    const issueIid = this.props.iid;
    const issueUrl = `${this.props.issueBaseUrl}/issues/${issueIid}/`;
    const issueState = issueStateBadge(this.props.state);
    let titleText = this.props.title || "no title";
    const title = <NavLink activeClassName="selected-issue" to={issueUrl}>
      {titleText}
    </NavLink>;

    return <ListGroupItem action className="pr-0 pl-0 pt-1 pb-1" style={{ border: "none" }}>
      <Row>
        <Col sm={8} md={8}>
          <div className="d-flex project-list-row mb-3">
            <div className="mr-2">
              <UserAvatar size="lg" person={this.props.author} />
            </div>
            <div className="issue-text-crop">
              <b>
                <span className="issue-title">
                  {title}
                </span>
              </b><br />
              <RenkuMarkdown markdownText={this.props.description} singleLine={true} />
            </div>
          </div>
        </Col>
        <Col sm={4} md={4} className="float-right" style={{ textAlign: "end" }}>
          <FontAwesomeIcon icon={faComments} /> {this.props.user_notes_count} {issueState}
          <br />
          <small><TimeCaption caption="Updated" time={this.props.updated_at} /></small>
        </Col>
      </Row>
    </ListGroupItem>;
  }
}

class IssueList extends Component {
  render() {
    const { issues, user, issuesState } = this.props;
    const rows = issues.map((d, i) =>
      <IssueListRow key={i} {...d}
        issueBaseUrl={this.props.collaborationUrl}
        projectId={this.props.projectId}
      />);

    return [
      <Row key="header" className="pb-3">
        <Col sm={8}>
          <h2>Issues
            {/* <ButtonGroup size="sm" className={"ml-4 pt-1"}>
              <Button
                color="primary"
                outline
                active={this.props.issuesState === issuesStateMap.OPENED}
                onClick={()=>this.props.handlers.setIssuesState(issuesStateMap.OPENED)}
              >
                Open
              </Button>
              <Button
                color="primary"
                outline
                active={this.props.issuesState === issuesStateMap.CLOSED}
                onClick={()=>this.props.handlers.setIssuesState(issuesStateMap.CLOSED)}
              >
                Complete
              </Button>
            </ButtonGroup> */}
          </h2>
        </Col>
        <Col sm={4}>
          {
            (user.logged) ?
              <small className="float-right" mr={1}>
                <Link className="btn btn-primary" role="button" to={this.props.issueNewUrl}>New Issue</Link>
              </small> :
              null
          }
        </Col>
      </Row>,
      <Row key="nav">
        <Col xs={12} className="pb-2">
          <Nav tabs>
            <NavItem>
              <ReactNavLink
                to="issues?page=1&issuesState=opened"
                isActive={() => issuesState === issuesStateMap.OPENED}
                tag={NavLink}
              >Open</ReactNavLink>
            </NavItem>
            <NavItem>
              <ReactNavLink
                to="issues?page=1&issuesState=closed"
                tag={NavLink}
                isActive={() => issuesState === issuesStateMap.CLOSED}
              >Complete</ReactNavLink>
            </NavItem>
          </Nav>
        </Col>
      </Row>,
      <Row key="issues"><Col xs={12}>
        {this.props.loading ?
          <Loader /> :
          <ListGroup>{rows}</ListGroup>
        }
      </Col></Row>,
      <Pagination key="pagination" {...this.props} />
    ];
  }
}

export default IssueList;
