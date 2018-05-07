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

import {StateKind, Schema, StateModel} from './Model';


const simpleSchema = new Schema({
  name: {initial: 'Jane Doe', mandatory: true},
  purpose: {initial: '', mandatory: false}
});

const complexSchema = new Schema({
  basics: {schema: simpleSchema, mandatory: true},
  subthing: {schema: {age: {initial: 0, mandatory: true }}, mandatory: true},
  createdAt: {initial: () => 'right now'}
});


class ComplexModel extends StateModel {
  constructor(stateBinding, stateHolder, initialState) {
    super(complexSchema, stateBinding, stateHolder, initialState)
  }

  // 'Fake' API request
  updateAge = () => {
    this.setUpdating({subthing: {age: true}});
    setTimeout(() => {
      this.setOne('subthing.age', Math.random())
    }, 1000);
  }
}


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
class ReduxStateComponent extends Component {

  constructor(props) {
    super(props);
    //this.thing = new StateModel(complexSchema, StateKind.REDUX)
    this.thing = new ComplexModel(StateKind.REDUX);
  }

  render(){
    const ConnectedShowProps = connect(this.thing.mapStateToProps, null, null, {storeKey: 'thingStore'})(ShowProps);

    return (
      <span>
        {/*Here we show the entire redux store and we update a sub-property of it on click*/}
        <ConnectedShowProps
          case="REDUX STATE"
          onClick={this.thing.updateAge}
          thingStore={this.thing.reduxStore}
        />

        {/*This is a stateful sub-component which inherits only a sub-part of the state tree.
        This sub-component will then invoke the presentational component on the sub-state only. */}
        <ReduxSubStateComponent subthing={this.thing.subModel('subthing')} />
      </span>
    );
  }
}

class ReduxSubStateComponent extends Component {
  render() {
    const subthing = this.props.subthing;

    // The default implementation of mapStateToProps maps the entire sub-tree
    // of the state to the props which are passed to the presentational component.
    const ConnectedShowProps = connect(
      subthing.mapStateToProps, undefined, undefined, {storeKey: 'subthingStore'}
    )(ShowProps);

    return <ConnectedShowProps
      case="REDUX SUBSTATE"
      onClick={subthing.baseModel.updateAge}
      subthingStore={subthing.reduxStore}
    />
  }
}


// Same for the react case...
class ReactStateComponent extends Component {
  constructor(props) {
    super(props);
    this.thing = new ComplexModel(StateKind.REACT, this);
  }

  render(){
    return <span>
      <ShowProps
        case="REACT STATE"
        // The react state can also be passed using {...this.state}, but we use the access using the model
        {...this.thing.get()}
        onClick={this.thing.updateAge}/>

      <ReactSubStateComponent subthing={this.thing.subModel('subthing')} />
    </span>
  }
}

class ReactSubStateComponent extends Component {
  render(){
    return <ShowProps
      case="REACT SUBSTATE"
      {...this.props.subthing.get()}
      onClick={this.props.subthing.baseModel.updateAge}/>
  }
}

export default Example
