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

/**
 *  renku-ui
 *
 *  CreatorsInput.js
 *  Presentational components.
 */

import React, { useEffect } from "react";
import ValidationAlert from "./ValidationAlert";
import HelpText from "./HelpText";
import { FormGroup, Input, Label, Row, Col, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faUserMinus } from "@fortawesome/free-solid-svg-icons";

function Creator(props) {

  const onChangeCreator = (event)=>{
    props.creator[event.target.name] = event.target.value;
    props.setCreator(props.creator);
  };

  return <Row>
    <Col md={4}>
      <Label for="name" size="sm" className="text-muted d-md-none">Name</Label>
      <FormGroup>
        <Input
          type="text"
          defaultValue={props.creator.name}
          name="name"
          disabled={props.disabled}
          onChange={onChangeCreator}
        />
      </FormGroup>
    </Col>
    <Col md={4}>
      <FormGroup>
        <Label for="affiliation" size="sm" className="text-muted d-md-none">Affiliation</Label>
        <Input
          type="affiliation"
          defaultValue={props.creator.affiliation}
          name="affiliation"
          disabled={props.disabled}
          onChange={onChangeCreator}
        />
      </FormGroup>
    </Col>
    <Col md={3}>
      <Label for="email" size="sm" className="text-muted d-md-none">Email</Label>
      <FormGroup>
        <Input
          type="email"
          defaultValue={props.creator.email}
          name="email"
          disabled={props.disabled}
          onChange={onChangeCreator}
        />
      </FormGroup>
    </Col>
    <Col md={1}>
      <FormGroup>
        <Button
          outline
          color="danger"
          disabled={props.disabled}
          onClick={props.deleteCreator}>
          <FontAwesomeIcon icon={faUserMinus} />
        </Button>
      </FormGroup>
    </Col>
  </Row>;
}

function CreatorsInput({ name, label, type, value, alert, placeholder, setInputs, help, disabled = false }) {

  const counter = React.useRef(value !== undefined && value.length > 0 ? value.length : 1);
  const [creators, setCreators] = React.useState(value !== undefined && value.length > 0 ?
    value.map((creator, index) => ({ id: index, name: creator.name, email: creator.email,
      affiliation: creator.affiliation, identifier: "" }))
    : [{ id: 1, name: "", email: "", affiliation: "", identifier: "" }]);


  const addEmptyCreator = () => {
    counter.current = counter.current + 1;
    setCreators(prevCreators => [...prevCreators,
      { id: counter.current, name: "", email: "", affiliation: "", identifier: "" }]);
  };

  const deleteCreator = (id) => {
    setCreators(creators.filter(creator => creator.id !== id));
  };

  const setCreator = (newCreator) => {
    setCreators(prevCreators =>
      prevCreators.map(oldCreator => oldCreator.id === newCreator.id ?
        { id: newCreator.id, name: newCreator.name, email: newCreator.email,
          affiliation: newCreator.affiliation, identifier: newCreator.identifier }
        : oldCreator)
    );
  };

  useEffect(()=>{
    const filteredCreators = creators.filter(creator =>
      !(creator.name === "" && creator.email === "" && creator.affiliation === ""));
    const artifitialEvent = {
      target: { name: name, value: filteredCreators },
      isPersistent: () => false
    };
    setInputs(artifitialEvent);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creators]);

  return <FormGroup>
    <Label htmlFor={name}>{label}</Label>
    <Row>
      <Col md={4} className="d-none d-md-block">
        <Label for="name" size="sm" className="text-muted">Name</Label>
      </Col>
      <Col md={4} className="d-none d-md-block">
        <Label for="affiliation" size="sm" className="text-muted">Affiliation</Label>
      </Col>
      <Col md={3} className="d-none d-md-block">
        <Label for="email" size="sm" className="text-muted">Email</Label>
      </Col>
    </Row>
    { creators.map((creator) =>
      <Creator
        key={"author" + creator.id}
        creator={creator}
        disabled={disabled}
        setCreator={setCreator}
        deleteCreator={()=>deleteCreator(creator.id)}
      />)
    }
    <Row>
      <Col>
        <FormGroup>
          <Button size="sm" color="light" disabled={disabled} onClick={addEmptyCreator}>
            <FontAwesomeIcon icon={faUserPlus} /> Add Creator
          </Button>
        </FormGroup>
      </Col>
    </Row>
    <HelpText content={help} />
    <ValidationAlert content={alert} />
  </FormGroup>;
}

export default CreatorsInput;
