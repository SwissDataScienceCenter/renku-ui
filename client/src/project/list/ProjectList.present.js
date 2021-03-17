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

import React, { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Col, Button, DropdownItem, DropdownMenu, DropdownToggle, Form, Input, InputGroup,
  Nav, NavItem, Row, ButtonDropdown } from "reactstrap";
import { faCheck, faSortAmountDown, faSortAmountUp, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ProjectAvatar, Loader, Pagination, TimeCaption, RenkuNavLink } from "../../utils/UIComponents";
import { ProjectTagList } from "../shared";
import { Url } from "../../utils/url";
import "../Project.css";
import { Label } from "reactstrap/lib";


function ProjectListRow(props) {
  const {
    owner, path, path_with_namespace, last_activity_at, description, compact, avatar_url, getAvatar, tag_list
  } = props;
  const namespace = props.namespace.full_path;

  const url = Url.get(Url.pages.project, { namespace, path });
  const title = (<Link to={url}>{path_with_namespace || "no title"}</Link>);

  let directionModifier = "", marginModifier = "";
  if (!compact) {
    directionModifier = " flex-sm-row";
    marginModifier = " ml-sm-auto";
  }

  return (
    <div className="d-flex limit-width pt-2 pb-2 border-top">
      <div className="d-flex flex-column mt-auto mb-auto">
        <ProjectAvatar
          owner={owner}
          avatar_url={avatar_url}
          namespace={namespace}
          getAvatarFromNamespace={getAvatar}
        />
      </div>
      <div className={"d-flex flex-fill flex-column ml-2 mw-0" + directionModifier}>
        <div className="d-flex flex-column text-truncate">
          <p className="mt-auto mb-auto text-truncate">
            <b>{title}</b>
            <span className="ml-2">
              <ProjectTagList tagList={tag_list} />
            </span>
          </p>
          {description ? <p className="mt-auto mb-auto text-truncate">{description}</p> : null}
        </div>
        <div className={"d-flex flex-shrink-0" + marginModifier}>
          <p className="mt-auto mb-auto">
            <TimeCaption caption="Updated" time={last_activity_at} />
          </p>
        </div>
      </div>
    </div>
  );
}

function ProjectListRows(props) {
  const { currentPage, getAvatar, perPage, projects, search, totalItems } = props;

  if (!projects || !projects.length)
    return (<p>We could not find any matching projects.</p>);

  const rows = projects.map(project => <ProjectListRow key={project.id} getAvatar={getAvatar} {...project} />);
  const onPageChange = (page) => { search({ page }); };

  return (
    <div>
      <div className="mb-4">{rows}</div>
      <Pagination currentPage={currentPage} perPage={perPage} totalItems={totalItems} onPageChange={onPageChange} />
    </div>
  );
}

function SearchInFilter(props) {
  const { loggedIn, params, sectionsMap, searchInMap, searchWithValues, currentSearchInObject } = props;

  // search in
  const [dropdownSearchIn, setDropdownSearchIn] = useState(false);
  const toggleDropdownSearchIn = () => setDropdownSearchIn(!dropdownSearchIn);
  if (!loggedIn)
    return null;

  const searchInItems = Object.values(searchInMap).map(v => (
    <DropdownItem key={v.value} value={v.value} onClick={() => { searchWithValues({ searchIn: v.value }); }}>
      {v.value === currentSearchInObject.value ? <FontAwesomeIcon icon={faCheck} /> : null} {v.text}
    </DropdownItem>
  ));

  return params.section === sectionsMap.all ?
    (
      <Fragment>
        <ButtonDropdown toggle={toggleDropdownSearchIn} isOpen={dropdownSearchIn}
          className="input-group-append input-group-prepend m-0">
          <DropdownToggle caret color="rk-white">
            {currentSearchInObject.text}
          </DropdownToggle>
          <DropdownMenu>
            {searchInItems}
          </DropdownMenu>
        </ButtonDropdown>
      </Fragment>
    ) :
    null;
}

function SearchOrder(props) {
  const { params, orderByMap, searchWithValues } = props;

  const orderingIcon = params.ascending ?
    faSortAmountUp :
    faSortAmountDown;
  const [dropdownOrderBy, setDropdownOrderBy] = useState(false);
  const toggleDropdownOrderBy = () => setDropdownOrderBy(!dropdownOrderBy);
  const currentOrderMapObject = Object.values(orderByMap).find(v => v.value === params.orderBy);


  const orderByItems = Object.values(orderByMap).map(v => (
    <DropdownItem key={v.value} value={v.value} onClick={() => { searchWithValues({ orderBy: v.value }); }}>
      {v.value === currentOrderMapObject.value ? <FontAwesomeIcon icon={faCheck} /> : null} {v.text}
    </DropdownItem>
  ));

  return <Fragment>
    <Col className="col-auto">
      <Label>
        Order by:&nbsp;&nbsp;
      </Label>
      <Fragment>
        <ButtonDropdown toggle={toggleDropdownOrderBy} isOpen={dropdownOrderBy}>
          <DropdownToggle caret color="rk-white">
            {currentOrderMapObject.text}
          </DropdownToggle>
          <DropdownMenu>
            {orderByItems}
          </DropdownMenu>
        </ButtonDropdown>
      </Fragment>
    </Col>
    <Col className="col-auto">
      <Button color="rk-white" onClick={() => { searchWithValues({ ascending: !params.ascending }); }}>
        <FontAwesomeIcon icon={orderingIcon} />
      </Button>
    </Col>
  </Fragment>;
}

function ProjectListSearch(props) {
  const { loggedIn, orderByMap, params, search, searchInMap, sectionsMap } = props;

  // input and search
  const [userInput, setUserInput] = useState(params.query.toString());

  const searchWithValues = (modifiedParams) => {
    let newParams = modifiedParams || {};
    if (params.query.toString() !== userInput.toString())
      newParams.query = userInput.toString();
    search(newParams);
  };
  useEffect(() => {
    // reset input on relevant changes.
    setUserInput(params.query);
    // ? on `query` because it can come from the an outside component (e.g. the QuickNav search)
    // ? on `page` because the user could modify the search and change page without searching first
  }, [params.query, params.page]);

  const currentSearchInObject = Object.values(searchInMap).find(v => v.value === params.searchIn);

  const navBar = props.loggedIn ?
    (<ProjectListNav key="navbar" getPreciseUrl={props.getPreciseUrl} sectionsMap={props.sectionsMap} />) :
    null;

  return (
    <Row className="justify-content-lg-between justify-content-md-center pb-2">
      {navBar}
      <Col md={12} lg={7} className="pb-2">
        <Form inline onSubmit={e => { e.preventDefault(); searchWithValues(); }}
          className="row row-cols-lg-auto justify-content-lg-end justify-content-md-center  g-1"
          size="sm">
          <Col className="col-auto">
            <InputGroup>
              <Input name="searchQuery" id="searchQuery"
                // className="border-light"
                className="border-light text-rk-text"
                placeholder={"Filter by... "} value={userInput}
                onChange={e => setUserInput(e.target.value.toString())} />
              <SearchInFilter loggedIn={loggedIn} params={params} sectionsMap={sectionsMap} searchInMap={searchInMap}
                searchWithValues={searchWithValues} currentSearchInObject={currentSearchInObject} />
            </InputGroup>
          </Col>
          <SearchOrder params={params} orderByMap={orderByMap} searchWithValues={searchWithValues} />
          <Col className="col-auto">
            <Button color="rk-white" id="searchButton" onClick={() => searchWithValues()}>
              <FontAwesomeIcon icon={faSearch} />
            </Button>
          </Col>
        </Form>
      </Col>
    </Row>
  );
}

function ProjectListUsersFilter(props) {
  const { users, setTarget, target } = props;

  let usersList = null;
  if (users.list && users.list.length) {
    usersList = users.list.map(u => {
      const identifier = u.full_path ?
        encodeURIComponent(u.full_path) :
        u.username;
      const active = target === identifier ?
        true :
        false;
      return (
        <Button key={u.id} className="mb-1 me-1" color="rk-white" size="sm"
          onClick={() => { setTarget(identifier); }} active={active}>
          { u.name}
          <small className="font-italic d-none d-sm-block">{decodeURIComponent(identifier)}</small>
        </Button>
      );
    });
  }

  const list = usersList ?
    (<Col className="d-flex justify-content-center justify-content-lg-start">
      {usersList}
    </Col>) :
    null;

  return (list);
}

function verifyRules(params, searchInMap, sectionsMap) {
  if (params.searchIn === searchInMap.projects.value || !params.searchIn) {
    if (params.query && params.query.length < 3)
      return "You can either leave the filter empty to browse all projects or enter at least 3 characters to filter.";
  }
  else {
    if (!params.query || params.query.length < 3)
      return `Filtering by ${params.searchIn.toLowerCase()} requires a filter of minimum 3 characters.`;
  }
}

function ProjectListContent(props) {
  const {
    fetched, fetching, getAvatar, loggedIn, orderByMap, params, projects, search, searchInMap, sectionsMap,
    setTarget, users, target, totalProjects
  } = props;

  let usersFilter = null;
  if (params.searchIn !== searchInMap.projects.value) {
    if (users.fetching)
      usersFilter = (<Loader />);
    else if (users.fetched)
      usersFilter = (<ProjectListUsersFilter users={users} setTarget={setTarget} target={target} />);
  }

  let content = null;
  // don't show anything if users are updating, since the content would be outdated
  if (!users.fetching) {
    if (fetching) {
      content = (<Loader />);
    }
    else if (!fetched) {
      content = (<p>Please enter text in the field above and click on Search to see the results.</p>);
    }
    else {
      const notAllowed = verifyRules(params, searchInMap, sectionsMap);
      if (notAllowed) {
        content = (<p>{notAllowed}</p>);
      }
      else {
        content = (
          <ProjectListRows
            currentPage={params.page || 1}
            perPage={params.perPage}
            getAvatar={getAvatar}
            projects={projects}
            search={search}
            totalItems={totalProjects}
          />
        );
      }
    }
  }

  return (
    <div>
      <div className="pb-4">
        <ProjectListSearch
          loggedIn={loggedIn}
          orderByMap={orderByMap}
          params={params}
          search={search}
          searchInMap={searchInMap}
          sectionsMap={sectionsMap}
          getPreciseUrl={props.getPreciseUrl}
        />
        {usersFilter}
      </div>
      {content}
    </div>
  );
}

function ProjectListNav(props) {
  const { getPreciseUrl, sectionsMap } = props;
  return (
    <Col className="d-flex pb-2 justify-content-evenly justify-content-lg-between" md={12} lg={5}>
      <Nav pills className="nav-pills-underline" size="sm">
        <NavItem>
          <RenkuNavLink title="Your Projects" id="link-projects-your"
            to={getPreciseUrl(sectionsMap.own)} noSubPath={true} />
        </NavItem>
        <NavItem>
          <RenkuNavLink title="Starred Projects" id="link-projects-starred"
            to={getPreciseUrl(sectionsMap.starred)} exact={false} />
        </NavItem>
        <NavItem>
          <RenkuNavLink title="All Projects" id="link-projects-all"
            to={getPreciseUrl(sectionsMap.all)} exact={false} />
        </NavItem>
      </Nav>
    </Col>
  );
}

function ProjectList(props) {
  const {
    fetched, fetching, getAvatar, loggedIn, orderByMap, params, projectNew, projects, search, searchInMap,
    sectionsMap, setTarget, users, target, totalProjects
  } = props;

  const newProjectButton = loggedIn ?
    (<div>
      <Link className="btn btn-secondary" role="button" to={projectNew}>
        <span className="arrow-right">  </span>
        New project
      </Link></div>) :
    null;
  return (
    <Fragment>
      <Row className="pt-2 pb-3">
        <Col className="d-flex mb-2 justify-content-between">
          <h2 className="mr-4">Renku Projects</h2>
          {newProjectButton}
        </Col>
      </Row>
      <ProjectListContent
        fetching={fetching}
        fetched={fetched}
        getAvatar={getAvatar}
        loggedIn={loggedIn}
        orderByMap={orderByMap}
        params={params}
        projects={projects}
        search={search}
        searchInMap={searchInMap}
        sectionsMap={sectionsMap}
        setTarget={setTarget}
        users={users}
        target={target}
        totalProjects={totalProjects}
        getPreciseUrl={props.getPreciseUrl}
      />
    </Fragment>
  );
}


export default ProjectList;
export { ProjectListRow, ProjectList };
