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
 *  Container components for project.
 */

import React, { Component } from 'react';
import { connect } from 'react-redux'
import { UserState } from '../../app-state';
import { StateKind, StateModel } from '../../model/Model';
// TODO: ONLY use one projectSchema after the refactoring has been finished.
import { newProjectSchema } from '../../model/RenkuModels';
import { slugFromTitle } from '../../utils/HelperFunctions';
import ProjectNew from './ProjectNew.present'


function groupVisibilitySupportsVisibility(groupVisibility, visibility) {
  if (visibility === 'private') return true;
  if (visibility === 'internal') return (groupVisibility === 'internal' || groupVisibility === 'public');
  // Public is the last remaining
  return (groupVisibility === 'public');
}

function projectVisibilitiesForGroupVisibility(groupVisibility='public') {
  const visibilities = [];
  visibilities.push({name: "Private", value: "private"});
  if (groupVisibilitySupportsVisibility(groupVisibility, 'internal'))
    visibilities.push({name: "Internal", value: "internal"});
  if (groupVisibilitySupportsVisibility(groupVisibility, 'public'))
    visibilities.push({name: "Public", value: "public"});
  return visibilities
}

class New extends Component {
  constructor(props) {
    super(props);
    
    this.newProject = new StateModel(newProjectSchema, StateKind.REDUX);
    this.state = {statuses: [], namespaces: [], namespaceGroup: null,
      visibilities: projectVisibilitiesForGroupVisibility(), templates: []
    };

    this.handlers = {
      onSubmit: this.onSubmit.bind(this),
      onTitleChange: this.onTitleChange.bind(this),
      onDescriptionChange: this.onDescriptionChange.bind(this),
      onVisibilityChange: this.onVisibilityChange.bind(this),
      onOptoutKgChange: this.onOptoutKgChange.bind(this),
      onProjectNamespaceChange: this.onProjectNamespaceChange.bind(this),
      onProjectNamespaceAccept: this.onProjectNamespaceAccept.bind(this),
      fetchMatchingNamespaces: this.fetchMatchingNamespaces.bind(this),
      onTemplateChange: this.onTemplateChange.bind(this),
      fetchProjectTemplates: this.fetchProjectTemplates.bind(this)
    };
    this.mapStateToProps = this.doMapStateToProps.bind(this);
  }

  async fetchProjectTemplates(){
    return this.props.client.getProjectTemplates(this.props.renkuTemplatesUrl, this.props.renkuTemplatesRef);
  }

  async componentDidMount() {
    const namespaces = await this.fetchNamespaces();
    if (namespaces == null) {
      // This seems to break in a test on Travis, but this code is not necessary locally. Need to investigate.
      this.setState({namespaces: []});
      return;
    }
    const username = this.props.user.username;
    const namespace = namespaces.data.filter(n => n.path === username)
    if (namespace.length > 0) this.newProject.set('meta.projectNamespace', namespace[0]);
    this.setState({namespaces});

    const templates = await this.fetchProjectTemplates();
    if (templates == null) {
      this.setState({templates: []});
      return;
    }
    this.setState({templates})
    if (templates.length > 0) this.newProject.set('meta.template', templates[0].folder);
    
  }

  refreshUserProjects(client, userStateDispatch) {
    client.getProjects({membership: true, order_by: 'last_activity_at'})
      .then(p => userStateDispatch(UserState.reSetMember(p)));
  }

  onSubmit() {
    if (this.newProject.get('display.errors')) {
      this.newProject.set('display.errors', []);
    }
    const validation = this.validate();
    if (validation.result) {
      this.newProject.set('display.loading', true);
      this.props.client.postProject(this.newProject.get(), this.props.renkuTemplatesUrl, this.props.renkuTemplatesRef)
        .then((project) => {
          this.refreshUserProjects(this.props.client, this.props.userStateDispatch);
          this.newProject.set('display.loading', false);
          this.props.history.push(`/projects/${project.id}`);
        })
        .catch(error => {
          let display_messages = [];
          if (error.errorData && error.errorData.message) {
            const all_messages = error.errorData.message;
            const messages = Object.keys(all_messages)
              .filter(mex => all_messages[mex].length)
              .reduce((obj, mex) => { obj[mex] = all_messages[mex]; return obj; }, {});
            
            // the most common error is the duplicate name, we can rewrite it for readability
            if (Object.keys(messages).includes("name") && /already.+taken/.test(messages["name"].join("; "))) {
              display_messages = [`title: ${messages["name"].join("; ")}`];
            }
            else {
              display_messages = Object.keys(messages)
                .map(mex => `${mex}: ${messages[mex].join("; ")}`);
            }
          }
          else {
            display_messages = ["unknown"];
          }
          this.newProject.set('display.errors', display_messages);
          this.newProject.set('display.loading', false);
        })
    }
  }

  validate() {
    const validation = this.newProject.validate()
    if (!validation.result) {
      this.setState({statuses: validation.errors});
    }
    return validation;
  }

  onTitleChange(e) {
    this.newProject.set('display.title', e.target.value);
    this.newProject.set('display.slug', slugFromTitle(e.target.value));
  }

  onDescriptionChange(e) { this.newProject.set('display.description', e.target.value); }
  
  onVisibilityChange(e) {
    this.newProject.set('meta.visibility', e.target.value);
    if (e.target.value !== "private") {
      this.newProject.set('meta.optoutKg', false);
    }
  }

  onTemplateChange(e) {
    this.newProject.set('meta.template', e.target.value);
  }

  onOptoutKgChange(e) {
    this.newProject.set('meta.optoutKg', e.target.checked);
  }

  onProjectNamespaceChange(value) {
    this.newProject.set('meta.projectNamespace', value);
  }

  onProjectNamespaceAccept() {
    const namespace = this.newProject.get('meta.projectNamespace');
    if (namespace.kind !== 'group') {
      const visibilities = projectVisibilitiesForGroupVisibility();
      this.setState({namespaceGroup: null, visibilities});
      return;
    }

    this.props.client.getGroupByPath(namespace.full_path).then(r => {
      const group = r.data;
      const visibilities = projectVisibilitiesForGroupVisibility(group.visibility);
      const visibility = this.newProject.get('meta.visibility');
      if (!groupVisibilitySupportsVisibility(group.visibility, visibility)) {
        // Default to the highest available visibility
        this.newProject.set('meta.visibility', visibilities[visibilities.length - 1].value);
      }
      this.setState({namespaceGroup: group, visibilities});
    })
  }

  doMapStateToProps(state, ownProps) {
    const model = this.newProject.mapStateToProps(state, ownProps);
    return {model}
  }

  fetchNamespaces(search=null) {
    const queryParams = {};
    if (search != null) queryParams['search'] = search;
    return this.props.client.getNamespaces(queryParams);
  }

  // https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
  escapeRegexCharacters(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async fetchMatchingNamespaces(search) {
    const namespaces = this.state.namespaces;
    if (namespaces.pagination.totalPages > 1) return this.fetchNamespaces(search).then(r => r.data);

    // We have all the data, just filter in the browser
    let escapedValue = this.escapeRegexCharacters(search.trim());
    if (escapedValue === '') escapedValue = '.*';
    const regex = new RegExp(escapedValue, 'i');
    return Promise.resolve(namespaces.data.filter(namespace => regex.test(namespace.path)))
  }

  render() {
    const ConnectedNewProject = connect(this.mapStateToProps)(ProjectNew);
    const statuses = {}
    this.state.statuses.forEach((d) => { Object.keys(d).forEach(k => statuses[k] = d[k])});
    return <ConnectedNewProject
      statuses={statuses}
      namespaces={this.state.namespaces.data}
      visibilities={this.state.visibilities}
      templates={this.state.templates}
      handlers={this.handlers}
      store={this.newProject.reduxStore}
      user={this.props.user} />;
  }
}


export default New
