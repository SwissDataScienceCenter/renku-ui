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
 *  TextInput.js
 *  Presentational components.
 */

import * as React from "react";
import ValidationAlert from "./ValidationAlert";
import HelpText from "./HelpText";
import { FormGroup, Input, Label, Row, Col, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faUserMinus } from "@fortawesome/free-solid-svg-icons";

function Creator(props) {

  //AFFILIATION FOR CREATOR???

  const onChangeCreator = (event)=>{
    props.creator[event.target.name] = event.target.value;
  };

  return <Row>
    <Col md={6}>
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
    <Col md={5}>
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
      <Button
        outline
        color="danger"
        disabled={props.disabled}
        onClick={props.deleteCreator}>
        <FontAwesomeIcon icon={faUserMinus} />
      </Button>
    </Col>
  </Row>;
}

function CreatorsInput({ name, label, type, value, alert, placeholder, setInputs, help, disabled = false }) {

  const counter = React.useRef(1);
  const [creators, setCreators] = React.useState(value !== undefined && value.length > 0 ?
    value.map((creator, index) => ({ id: index, name: creator.name, email: creator.email, identifier: "" }))
    : [{ id: 1, name: "", email: "", identifier: "" }]);

  const addEmptyCreator = () => {
    counter.current = counter.current + 1;
    setCreators(prevCreators => [...prevCreators,
      { id: counter.current, name: "", email: "", identifier: "" }]);
  };

  const deleteCreator = (id) => {
    setCreators(creators.filter(creator => creator.id !== id));
  };

  React.useEffect(()=>{
    const artifitialEvent = {
      target: { name: name, value: creators },
      isPersistent: () => false
    };
    setInputs(artifitialEvent);
    //eslint-disable-next-line
  }, [creators]);

  return <FormGroup>
    <Label htmlFor={name}>{label}</Label>
    <Row>
      <Col md={6}>
        <Label for="name" size="sm" className="text-muted">Name</Label>
      </Col>
      <Col md={5}>
        <Label for="email" size="sm" className="text-muted">Email</Label>
      </Col>
    </Row>
    { creators.map((creator) =>
      <Creator
        key={"author" + creator.id}
        creator={creator}
        disabled={disabled}
        deleteCreator={()=>deleteCreator(creator.id)}
      />)
    }
    <Row>
      <Col>
        <Button size="sm" color="light" disabled={disabled} onClick={addEmptyCreator}>
          <FontAwesomeIcon icon={faUserPlus} /> Add Creator
        </Button>
      </Col>
    </Row>
    <HelpText content={help} />
    <ValidationAlert content={alert} />
  </FormGroup>;
}

export default CreatorsInput;
