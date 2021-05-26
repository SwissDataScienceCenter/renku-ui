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

import React, { Component, Fragment } from "react";
import { Link, Route, Switch } from "react-router-dom";
import { Row, Col, Alert, Card, CardBody } from "reactstrap";
import { Button, Form, FormText, Input, Label, InputGroup, UncontrolledCollapse } from "reactstrap";
import { DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { stringScore } from "../../utils/HelperFunctions";
import { Loader, Pagination, MarkdownTextExcerpt, TimeCaption } from "../../utils/UIComponents";
import { faCheck, faSortAmountUp, faSortAmountDown, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ButtonDropdown } from "reactstrap/lib";


class DatasetListRow extends Component {

  render() {
    const datasetsUrl = this.props.datasetsUrl;
    const dataset = this.props.dataset;
    const projectsCountLabel = dataset.projectsCount > 1
      ? `In ${dataset.projectsCount} projects`
      : `In ${dataset.projectsCount} project`;

    const colorsArray = ["green", "pink", "yellow"];
    const color = colorsArray[stringScore(dataset.name) % 3];
    const datasetDate = new Date(dataset.date);

    return <Link className="d-flex flex-row rk-search-result"
      to={`${datasetsUrl}/${encodeURIComponent(dataset.identifier)}`}>
      <span className={"triangle me-3 mt-2 " + color}></span>
      <Col className="d-flex align-items-start flex-column col-10 overflow-hidden">
        <div className="title d-inline-block text-truncate">
          {dataset.title || dataset.name}
        </div>
        <div className="creators text-truncate text-rk-text">
          {
            dataset.published !== undefined && dataset.published.creator !== undefined ?
              <small style={{ display: "block" }} className="font-weight-light">
                {dataset.published.creator.slice(0, 3).map((creator) => creator.name).join(", ")}
                {dataset.published.creator.length > 3 ? ", et al." : null}
              </small>
              : null
          }
        </div>
        <div className="description text-truncate text-rk-text">
          {
            dataset.description !== undefined && dataset.description !== null ?
              <div className="datasetDescriptionText font-weight-normal">
                <MarkdownTextExcerpt markdownText={dataset.description} charsLimit={500} />
              </div>
              : null
          }
        </div>
        <div className="mt-auto">
          {
            dataset.date ?
              <TimeCaption caption="Created"
                time={datasetDate} className="text-secondary"/>
              : null
          }
        </div>
      </Col>
      <Col className="d-flex justify-content-end flex-shrink-0">
        <span className="text-secondary">
          <small>
            {projectsCountLabel}
          </small>
        </span>
      </Col>
    </Link>;
  }
}

function OrderByDropdown(props) {
  return <Fragment>
    <Col className="col-auto ms-2">
      <Label className="text-rk-text">
        Order by:&nbsp;
      </Label>
      <Fragment>
        <ButtonDropdown
          toggle={props.handlers.onOrderByDropdownToggle}
          isOpen={props.orderByDropdownOpen}>
          <DropdownToggle caret color="rk-light">
            {props.orderByLabel}
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem value={props.orderByValuesMap.TITLE}
              onClick={props.handlers.changeSearchDropdownOrder}>
              {props.orderBy === props.orderByValuesMap.TITLE ?
                <FontAwesomeIcon icon={faCheck} /> : null} Title
            </DropdownItem>
            <DropdownItem value={props.orderByValuesMap.DATE}
              onClick={props.handlers.changeSearchDropdownOrder}>
              {props.orderBy === props.orderByValuesMap.DATE ?
                <FontAwesomeIcon icon={faCheck} /> : null} Date
            </DropdownItem>
            <DropdownItem value={props.orderByValuesMap.PROJECTSCOUNT}
              onClick={props.handlers.changeSearchDropdownOrder}>
              {props.orderBy === props.orderByValuesMap.PROJECTSCOUNT ?
                <FontAwesomeIcon icon={faCheck} /> : null} Projects Count
            </DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
      </Fragment>
    </Col>
    <Col className="col-auto">
      <Button color="rk-white" onClick={props.handlers.toggleSearchSorting}>
        {props.orderSearchAsc ?
          <FontAwesomeIcon icon={faSortAmountUp} /> :
          <FontAwesomeIcon icon={faSortAmountDown} />
        }
      </Button>
    </Col>
  </Fragment>;
}

class DatasetSearchForm extends Component {

  render() {
    return <Row className="justify-content-lg-between justify-content-md-center pb-2">
      <Col md={12} className="pb-2">
        <Form key="form" inline onSubmit={this.props.handlers.onSearchSubmit}
          className="row row-cols-lg-auto justify-content-start g-1 pb-2">
          <Col className="col-auto w-25 d-inline-block">
            <InputGroup>
              <Input type="text"
                name="searchQuery"
                id="searchQuery"
                placeholder={"Search... "}
                value={decodeURIComponent(this.props.searchQuery) || ""}
                onChange={this.props.handlers.onSearchQueryChange}
                className="border-light text-rk-text" />
              <Label for="searchQuery" hidden>Query</Label>
            </InputGroup>
          </Col>
          <OrderByDropdown
            handlers={this.props.handlers}
            orderByDropdownOpen={this.props.orderByDropdownOpen}
            orderByLabel={this.props.orderByLabel}
            orderByValuesMap={this.props.orderByValuesMap}
            orderBy={this.props.orderBy}
            orderSearchAsc={this.props.orderSearchAsc}
          />
          <Col className="col-auto">
            <Button color="rk-white" id="searchButton" onClick={this.props.handlers.onSearchSubmit}>
              <FontAwesomeIcon icon={faSearch} />
            </Button>
          </Col>
        </Form>
        <Col sm={12}>
          <FormText key="help" color="rk-text">
            {this.props.errorMessage} If you are not finding what you are looking
            for, <Button className="p-0 mb-1" color="link" id="toggler">
              <small>click here for help.</small>
            </Button>
          </FormText>
          <UncontrolledCollapse key="searchHelp" toggler="#toggler" className="pt-2">
            <Card>
              <CardBody>
                <small className="text-rk-text">
                  <p>
                    A wildcard can be used to broaden your search: &apos;*&apos; for any number of
                    characters or &apos;?&apos; for one character.
                    Quotation marks can be used to make your search more specific. <br />
                  </p>
                  Examples:<br />
                  - &quot;ren*&quot; will match any word starting with &quot;ren&quot;,
                  like <i>renku</i> and <i>renga</i><br />
                  - &quot;*ku&quot; will match any word that ends with &quot;ku&quot;,
                  like <i>renku</i> and <i>haiku</i><br />
                  - &quot;re*ku&quot; will match any word that ends with &quot;re&quot; and ends with &quot;ku&quot;,
                  like <i>renku</i> and <i>relotsofstuffku</i><br />
                  - &quot;re?ku&quot; will match any five-letter word that starts with re and ends with u.,
                  like <i>renku</i> and <i>renzu</i><br />
                  - &quot;reku~2&quot; will perform a fuzzy search and match any word with up
                  to 2 changes to the string &quot;reku&quot;,
                  like <i>renku</i> and <i>akku</i><br />
                  - Quotation marks around a phrase will match a specific phrase, like &quot;renku
                  reproducibility&quot;.<br />
                </small>
              </CardBody>
            </Card>
          </UncontrolledCollapse>
        </Col>
      </Col>
    </Row>;
  }
}

class DatasetsRows extends Component {
  render() {
    if (this.props.loading) return <Col md={{ size: 2, offset: 3 }}><Loader /></Col>;
    const datasets = this.props.datasets || [];
    const rows = datasets.map((p) => <DatasetListRow key={p.identifier}
      datasetsUrl={this.props.urlMap.datasetsUrl}
      dataset={p} />);
    return <div className="mb-4">{rows}</div>;
  }
}


class DatasetsSearch extends Component {
  render() {
    const loading = this.props.loading || false;
    return [
      <div key="form">
        {
          (this.props.loggedOutMessage !== undefined) ?
            <Col bg={6} md={8} sm={12} ><span>{this.props.loggedOutMessage}</span><br /><br /></Col>
            :
            <span></span>
        }
        <div className="pb-2 rk-search-bar">
          <DatasetSearchForm
            searchQuery={this.props.searchQuery}
            handlers={this.props.handlers}
            errorMessage={this.props.errorMessage}
            orderByValuesMap={this.props.orderByValuesMap}
            orderBy={this.props.orderBy}
            orderByDropdownOpen={this.props.orderByDropdownOpen}
            orderSearchAsc={this.props.orderSearchAsc}
            orderByLabel={this.props.orderByLabel}
          />
        </div>
      </div>,
      <DatasetsRows
        key="datasets"
        datasets={this.props.datasets}
        urlMap={this.props.urlMap}
        loading={loading}
      />,
      <Pagination key="pagination" {...this.props}
        className="d-flex justify-content-center rk-search-pagination"/>
    ];
  }
}

class NotFoundInsideDataset extends Component {
  render() {
    return <Col key="notFound">
      <Row>
        <Col xs={12} md={12}>
          <Alert color="primary">
            <h4>404 - Page not found</h4>
            The URL
            <strong> {this.props.location.pathname.replace(this.props.match.url, "")} </strong>
            is not a sub-path of <strong>/datasets</strong>. You can navigate through renku datasets
            using the tabs on top.
          </Alert>
        </Col>
      </Row>
    </Col>;
  }
}

class DatasetList extends Component {
  render() {
    const urlMap = this.props.urlMap;

    return <Fragment>
      <Row className="pt-2 pb-3">
        <Col className="d-flex mb-2">
          <h2 className="mr-4">Renku Datasets</h2>
        </Col>
      </Row>
      <Switch>
        <Route exact path={urlMap.datasetsUrl}
          render={props => <DatasetsSearch {...this.props} />} />
        <Route component={NotFoundInsideDataset} />
      </Switch>
    </Fragment>;
  }
}

export default DatasetList;
export { DatasetListRow };
