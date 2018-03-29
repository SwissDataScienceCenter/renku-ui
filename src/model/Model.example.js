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


import React, { Component } from 'react';
import { connect } from 'react-redux';

import {StateKind, Schema, StateModelComponent} from './Model';

// 'Fake' API request.
function onClick() {
  this.model.setUpdating({subthing: {age: true}});
  setTimeout(() => {
    this.model.setOne('subthing.age', Math.random())
  }, 1000);
}

const simpleSchema = new Schema({
  name: {initial: 'Jane Doe', mandatory: true},
  purpose: {initial: '', mandatory: false}
});

const complexSchema = new Schema({
  basics: {schema: simpleSchema, mandatory: true},
  subthing: {schema: {age: {initial: 0, mandatory: true }}, mandatory: true},
  createdAt: {initial: () => 'right now'}
});


class TestPresent extends Component {
  render() {
    return <div>
      <p>Test Component</p>
      {['basics', 'subthing', 'created_at'].map(
        (prop) => <p key={prop}>{`${prop}: ${JSON.stringify(this.props[prop])}`}</p>
      )}
      <button onClick={this.props.onClick}/>
    </div>
  }
}


class ExampleReduxStateComponent extends StateModelComponent {
  constructor(props) {
    super(props, complexSchema, StateKind.REDUX);
  }

  render(){
    // Our StateModelComponent class already has a default mapStateToProps method defined.
    const VisibleTestPresent = connect(this.mapStateToProps)(TestPresent);
    return <VisibleTestPresent
      store={this.store}
      onClick={onClick.bind(this)}
    />
  }
}


class ExampleReactStateComponent extends StateModelComponent {
  constructor(props) {
    super(props, complexSchema, StateKind.REACT);
  }

  render(){
    return <TestPresent
      {...this.model.get()}
      onClick={onClick.bind(this)}
    />
  }
}

export { ExampleReactStateComponent, ExampleReduxStateComponent }
