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

/**
 *  incubator-renku-ui
 *
 *  Project.js
 *  Container components for fork project.
 */

import React, { Component } from 'react';
import { connect } from 'react-redux'
import { slugFromTitle } from '../../utils/HelperFunctions';
import { StateKind, StateModel } from '../../model/Model';
import { forkProjectSchema } from '../../model/RenkuModels';
import ForkProjectModal from './ProjectFork.present'


class Fork extends Component {
  constructor(props) {
    super(props);
    this.forkProject = new StateModel(forkProjectSchema, StateKind.REDUX);
    this.handlers = {
      onSubmit: this.onSubmit.bind(this),
      onProjectNamespaceChange: this.onProjectNamespaceChange.bind(this),
      onProjectNamespaceAccept: this.onProjectNamespaceAccept.bind(this),
      fetchMatchingNamespaces: this.fetchMatchingNamespaces.bind(this),
      fetchAllNamespaces: this.fetchAllNamespaces.bind(this),
      toogleForkModal: this.toogleForkModal.bind(this),
      onTitleChange: this.onTitleChange.bind(this),
      setProjectTitle: this.setProjectTitle.bind(this)
    };
    this.mapStateToProps = this.doMapStateToProps.bind(this);
  }

  async fetchAllNamespaces() {
    if (!this.forkProject.get('display.namespacesFetched')) {
      this.forkProject.set('display.namespacesFetched', true)
      const namespaces = await this.fetchNamespaces();
      if (namespaces == null) {
        // This seems to break in a test on Travis, but this code is not necessary locally. Need to investigate.
        this.forkProject.set('display.namespaces', [])
        return;
      }
      const username = this.props.user.data.username;
      const namespace = namespaces.data.filter(n => n.path === username)
      if (namespace.length > 0) this.forkProject.set('meta.projectNamespace', namespace[0]);
      this.forkProject.set('display.namespaces', namespaces)
    }
  }

  setProjectTitle(title) {
    this.forkProject.set('display.title', title);
    this.forkProject.set('display.slug', slugFromTitle(title));
  }

  onTitleChange(e) {
    this.setProjectTitle(e.target.value);
  }

  onSubmit() {
    this.forkProject.set('meta.id', this.props.projectId)
    if (this.forkProject.get('display.errors')) {
      this.forkProject.set('display.errors', []);
    }

    this.forkProject.set('display.loading', true);
    this.props.client.forkProject(this.forkProject.get(), this.props.history)
      .catch(error => {
        let display_messages = [];
        if (error.errorData && error.errorData.message) {
          const all_messages = error.errorData.message;
          if (all_messages instanceof Object) {
            const messages = Object.keys(all_messages)
              .reduce((obj, mex) => { obj[mex] = all_messages[mex]; return obj; }, {});
            // the most common error is the duplicate name, we can rewrite it for readability
            if (Object.keys(messages).includes("name") && /already.+taken/.test(messages["name"].join("; "))) {
              display_messages = [`title: ${messages["name"].join("; ")}`];
            }
            else {
              display_messages = Object.keys(messages).map(mex => `${mex}: ${messages[mex].join("; ")}`);
            }
          }
          else {
            display_messages = [all_messages];
          }
        }
        else {
          display_messages = ["unknown"];
        }
        this.forkProject.set('display.errors', display_messages);
        this.forkProject.set('display.loading', false);
      });

  }

  onProjectNamespaceChange(value) {
    if (this.forkProject.get('display.errors')) {
      this.forkProject.set('display.errors', []);
    }
    this.forkProject.set('meta.projectNamespace', value);
  }

  onProjectNamespaceAccept() {
    const namespace = this.forkProject.get('meta.projectNamespace');
    if (namespace.kind !== 'group') {
      this.forkProject.set('display.namespaceGroup', null)
      return;
    }

    this.props.client.getGroupByPath(namespace.full_path).then(r => {
      const group = r.data;
      this.forkProject.set('display.namespaceGroup', group)
    })
  }

  doMapStateToProps(state, ownProps) {
    const model = this.forkProject.mapStateToProps(state, ownProps);
    return { model }
  }

  fetchNamespaces(search = null) {
    const queryParams = {};
    if (search != null) queryParams['search'] = search;
    return this.props.client.getNamespaces(queryParams);
  }

  // https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
  escapeRegexCharacters(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async fetchMatchingNamespaces(search) {
    if (this.forkProject.get('display.namespaces')) {
      const namespaces = this.forkProject.get('display.namespaces');
      if (namespaces.pagination.totalPages > 1) return this.fetchNamespaces(search).then(r => r.data);

      // We have all the data, just filter in the browser
      let escapedValue = this.escapeRegexCharacters(search.trim());
      if (escapedValue === '') escapedValue = '.*';
      const regex = new RegExp(escapedValue, 'i');
      return Promise.resolve(namespaces.data.filter(namespace => regex.test(namespace.path)))
    }
  }

  toogleForkModal(e) {
    if (this.forkProject.get('display.errors')) {
      this.forkProject.set('display.errors', []);
    }
    this.props.toogleForkModal(e);
  }

  render() {
    const ConnectedForkProject = connect(this.mapStateToProps)(ForkProjectModal);
    return <ConnectedForkProject
      forkModalOpen={this.props.forkModalOpen}
      namespaces={this.forkProject.get('display.namespaces.data')}
      visibilities={this.forkProject.get('display.visibilities')}
      templates={this.forkProject.get('display.templates')}
      handlers={this.handlers}
      store={this.forkProject.reduxStore}
      title={this.props.title}
      user={this.props.user} />;
  }
}


export default Fork;
