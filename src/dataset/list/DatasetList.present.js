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

import React, { Component } from 'react';
import { Link, Route, Switch }  from 'react-router-dom';
import { Row, Col, Alert, Card, CardBody, Badge } from 'reactstrap';
import { Button, Form, FormText, Input, Label, InputGroup, UncontrolledCollapse } from 'reactstrap';
import { InputGroupButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap';
import { Loader, Pagination } from '../../utils/UIComponents';
import { faCheck, faSortAmountUp, faSortAmountDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


class DatasetListRow extends Component {

  HTMLtoText = (textContent) =>{
    var temp = document.createElement("div");
    temp.innerHTML = textContent;
    return temp.textContent || temp.innerText || "";
  }

  render() {
    const datasetsUrl = this.props.datasetsUrl;
    const dataset = this.props.dataset;
    const projectsCountLabel= dataset.projectsCount > 1
      ? `In ${dataset.projectsCount} projects`
      : `In ${dataset.projectsCount} project`;
    return <Card style={{ marginBottom: '1rem'}} key={dataset.identifier}>
      <CardBody>
        <div className="float-right">
          <Badge color="success" className="font-weight-light">{projectsCountLabel}</Badge>
        </div>
        <Link to={`${datasetsUrl}/${encodeURIComponent(dataset.identifier)}`}>
          {dataset.name || 'no title'}
        </Link>
        {
          dataset.published !== undefined &&  dataset.published.creator !== undefined?
            <small style={{ display: 'block'}} className="font-weight-light">
              { dataset.published.creator.map((creator) => creator.name).join("; ") }
            </small>
            : null
        }
        {
          dataset.description !== undefined && dataset.description !== null?
            <p className="datasetDescriptionText font-weight-normal">
              {dataset.description.length > 500 ?
                this.HTMLtoText(dataset.description).substr(0,500)+"...":
                this.HTMLtoText(dataset.description)
              }
            </p>
            : null
        }
        {
          dataset.published !== undefined && dataset.published.datePublished !== undefined ?
            <small className="font-italic">
              {"Date published: "+new Date(dataset.published.datePublished).toLocaleDateString()}
            </small>
            : null
        }
      </CardBody>
    </Card>
  }
}

class DatasetSearchForm extends Component {
  render() {
    return [<Form key="form" onSubmit={this.props.handlers.onSearchSubmit} style={{display:'flex'}}>
      <InputGroup>
        <Input type="text"
          name="searchQuery"
          id="searchQuery"
          value={decodeURIComponent(this.props.searchQuery) || ''}
          onChange={this.props.handlers.onSearchQueryChange}
          className="border-primary"/>
        <Label for="searchQuery" hidden>Query</Label>
        <InputGroupButtonDropdown addonType="append" toggle={this.props.handlers.onOrderByDropdownToogle} isOpen={this.props.orderByDropdownOpen} >
          <Button outline color="primary" onClick={this.props.handlers.toogleSearchSorting}>
            { this.props.orderSearchAsc ? <FontAwesomeIcon icon={faSortAmountUp}/> : <FontAwesomeIcon icon={faSortAmountDown}/> }
          </Button>
          <DropdownToggle outline caret color="primary" >
            Order by: {this.props.orderByLabel}
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem value={this.props.orderByValuesMap.NAME} onClick={this.props.handlers.changeSearchDropdownOrder}>
              {this.props.orderBy === this.props.orderByValuesMap.NAME ? <FontAwesomeIcon icon={faCheck} /> :null} Name
            </DropdownItem>
            <DropdownItem value={this.props.orderByValuesMap.DATE_PUBLISHED} onClick={this.props.handlers.changeSearchDropdownOrder}>
              {this.props.orderBy === this.props.orderByValuesMap.DATE_PUBLISHED ? <FontAwesomeIcon icon={faCheck} /> :null} Date Published
            </DropdownItem>
            <DropdownItem value={this.props.orderByValuesMap.PROJECTSCOUNT} onClick={this.props.handlers.changeSearchDropdownOrder}>
              {this.props.orderBy === this.props.orderByValuesMap.PROJECTSCOUNT ? <FontAwesomeIcon icon={faCheck} /> :null} Projects Count
            </DropdownItem>
          </DropdownMenu>
        </InputGroupButtonDropdown>
      </InputGroup>
      &nbsp;
      <Button color="primary" onClick={this.props.handlers.onSearchSubmit}>
          Search
      </Button>
    </Form>
    ,
    <FormText key="help" color="muted">{this.props.errorMessage} If you are not finding what you are looking for, <Button className="pr-0 pl-0 pt-0 pb-0 mb-1" color="link" id="toggler"><small>click here for help.</small></Button> </FormText>,
    <UncontrolledCollapse key="searchHelp" toggler="#toggler" className="pt-2">
      <Card>
        <CardBody>
          <small>
            <p>
              A wildcard can be used to broaden your search: '*' for any number of characters or '?' for one character.
              Quotation marks can be used to make your search more specific. <br/>
            </p>
            Examples:<br />
          - "ren*" will match any word starting with "ren", like <i>renku</i> and <i>renga</i><br/>
          - "*ku" will match any word that ends with "ku", like <i>renku</i> and <i>haiku</i><br/>
          - "re*ku" will match any word that ends with "re" and ends with "ku",
            like <i>renku</i> and <i>relotsofstuffku</i><br/>
          - "re?ku" will match any five-letter word that starts with re and ends with u.,
            like <i>renku</i> and <i>renzu</i><br/>
          - "reku~2" will perform a fuzzy search and match any word with up to 2 changes to the string "reku",
            like <i>renku</i> and <i>akku</i><br/>
          - Quotation marks around a phrase will match a specific phrase, like "renku reproducibility".<br />
          </small>
        </CardBody>
      </Card>
    </UncontrolledCollapse>
    ]
  }
}

class DatasetsRows extends Component{
  render(){
    if(this.props.loading) return <Col md={{size: 2,  offset: 3}}><Loader /></Col>
    const datasets = this.props.datasets || [];
    const rows = datasets.map( (p) => <DatasetListRow key={p.identifier}
      datasetsUrl={this.props.urlMap.datasetsUrl}
      dataset={p} />);
    return <Col bg={6} md={8} sm={12}>{rows}</Col>;
  }
}


class DatasetsSearch extends Component {
  render() {
    const loading = this.props.loading || false;
    return [<Row key="form">
      {
        (this.props.loggedOutMessage !== undefined) ?
          <Col bg={6} md={8} sm={12} ><span>{this.props.loggedOutMessage}</span><br/><br/></Col>
          :
          <span></span>
      }
      <Col md={8}>
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
      </Col>
    </Row>,
    <Row key="spacer2"><Col md={8}>&nbsp;</Col></Row>,
    <Row key="datasets">
      <DatasetsRows
        datasets={this.props.datasets}
        urlMap={this.props.urlMap}
        loading={loading}
      />
    </Row>,
    <Pagination key="pagination" {...this.props} />
    ];
  }
}

class NotFoundInsideDataset extends Component {
  render(){
    return <Col key="nofound">
      <Row>
        <Col xs={12} md={12}>
          <Alert color="primary">
            <h4>404 - Page not found</h4>
          The URL
            <strong> { this.props.location.pathname.replace(this.props.match.url,'') } </strong>
           is not a subpath of <strong>/datasets</strong>. You can navigate through renku datasets using the tabs on top.
          </Alert>
        </Col>
      </Row>
    </Col>
  }
}

class DatasetList extends Component {
  render() {
    const urlMap = this.props.urlMap;
    return [
      <Row key="header">
        <Col md={3} lg={2}><h1>Datasets</h1></Col>
      </Row>,
      <Row key="content">
        <Col key="" md={12}>
          <Switch>
            <Route exact path={urlMap.datasetsUrl}
              render= { props => <DatasetsSearch {...this.props} />} />
            <Route component={NotFoundInsideDataset} />
          </Switch>
        </Col>
      </Row>
    ]
  }
}

export default DatasetList;
export { DatasetListRow }
