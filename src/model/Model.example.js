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
import { Provider, connect } from 'react-redux';

import {StateKind, Schema, StateModelComponent, StateModelSubComponent} from './Model';

// 'Fake' API request.
function onClickNested() {
  this.model.setUpdating({subthing: {age: true}});
  setTimeout(() => {
    this.model.setOne('subthing.age', Math.random())
  }, 1000);
}


function onClick() {
  this.model.setUpdating({age: true});
  setTimeout(() => {
    this.model.setOne('age', Math.random())
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

class Example extends Component {
  render() {

    // We do exactly the same thing twice, once for a redux state and once
    // for the normal react state.

    return [
      <ReduxStateComponent key="redux" />,
      <ReactStateComponent key="react" />
    ];
  }
}


// A simple presentational component which shows all props which are passed into it.
class ShowProps extends Component {
  render() {
    return <div style={{border : '1px black solid', margin: '5px'}}>
      {Object.keys(this.props)
        .filter(propKey => !(this.props[propKey] instanceof Function))
        .map(
          (propKey) => <p key={propKey}>{`${propKey}: ${JSON.stringify(this.props[propKey])}`}</p>
        )
      }
      <button onClick={this.props.onClick}>Change Age</button>
    </div>
  }
}

// First the redux case...
class ReduxStateComponent extends StateModelComponent {

  constructor(props) {
    super(props, complexSchema, StateKind.REDUX);
  }

  render(){
    // Our StateModelComponent class already has a default mapStateToProps method defined.
    const VisibleShowProps = connect(this.mapStateToProps)(ShowProps);
    return (
      <Provider store={this.store}>
        <span>

          {/*Here we show the entire redux store and we update a sub-property of it on click*/}
          <VisibleShowProps
            case="REDUX STATE"
            onClick={onClickNested.bind(this)}
          />

          {/*This is a stateful sub-component which inherits only a sub-part of the state tree.
          This sub-component will then invoke the presentational component on the sub-state only. */}
          <ReduxSubStateComponent
            model={this.model}
            path={'subthing'}
          />

        </span>
      </Provider>
    );
  }
}

class ReduxSubStateComponent extends StateModelSubComponent {
  render() {
    // The default implementation of mapStateToProps maps the entire sub-tree
    // of the state to the props which are passed to the presentational component.
    const VisibleShowProps = connect(this.mapStateToProps)(ShowProps);
    return <VisibleShowProps case="REDUX SUBSTATE" onClick={onClick.bind(this)}/>
  }
}


// Same for the react case...
class ReactStateComponent extends StateModelComponent {
  constructor(props) {
    super(props, complexSchema, StateKind.REACT);
  }

  render(){
    return <span>
      <ShowProps
        case="REACT STATE"
        // The entire redux state can also be passed to using {...this.state},
        // but we try use the access through the model
        {...this.model.get()}
        onClick={onClickNested.bind(this)}/>

      <ReactSubStateComponent
        model={this.model}
        path="subthing"/>
    </span>
  }
}

class ReactSubStateComponent extends StateModelSubComponent {
  render(){

    return <ShowProps
      case="REACT SUBSTATE"
      {...this.model.get()}
      onClick={onClick.bind(this)}/>
  }
}

export default Example
