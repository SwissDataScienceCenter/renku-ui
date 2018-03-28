import client from '../gitlab/test-client'
import ReactDOM from "react-dom";
import { Project, projectSchema } from './RengaModels';
import {Component} from "react";
import State from "../project/Project.state";
import {connect} from "react-redux";
import {createStore} from "../utils/EnhancedState";
import Present from "../project/Project.present";


// TODO: CREATE API RELATED TESTS


// describe('fetch project', () => {
//   it('fetches project', () => {
//     const projectId = 1;
//     const options = {metadata: true, display: true};
//     const project = client.getProject(projectId, options);
//     project.set('readme', client.getProject(projectId, {readme: true}));
//   });
//   it('fetches project', () => {
//     const options = {metadata: true, display: true};
//     const project = Project.fetch(client, 1, options);
//   });
// });
//
// describe('fetch project', () => {
//   const store = createStore(projectSchema.reducer());
//   // const project = projectSchema.toModel(store, client);
//   const project = new Project(store, client);
//   it('fetches project - syntax 1', () => {
//     const options = {metadata: true, display: true};
//     const projectId = 1;
//     project.fetch(projectId, options);
//     project.fetch({readme: true});
//   });
//
// });
//
// class View extends Component {
//   constructor(props) {
//     super(props);
//     this.store = createStore(projectSchema.reducer());
//     this.project = null;
//   }
//
//   componentDidMount() {
//     this.retrieveProject();
//   }
//
//   retrieveProject() {
//     this.store.dispatch(State.View.fetchMetadata(this.props.client, this.props.id));
//     const options = {readme: true};
//     this.store.dispatch((dispatch) => {
//       const serverRequestAction = {type:'server_request', options};
//       dispatch(serverRequestAction);
//       this.props.client.getProject(this.props.id, options).then(d => dispatch(View.receive(d, options)))
//     }
//   }
//
//   retrieveProject2() {
//     const options = {metadata: true};
//     const returnPromise = this.props.client.fetchProjects(this.props.id, options);
//     returnPromise.then((result) => this.setState((prevState) => {
//         return {...prevState, ...result} // Again not so nice for nested properties - let's try to use the convenient method
//       }
//     ));
//     returnPromise.then((result) => {
//       this.setState({project: this.state.project.setMany(result)})
//     });
//
//     this.store.dispatch((dispatch) => {
//       dispatch(projectSchema.willRequestFromServer(options));
//       this.props.client.fetchProject(this.props.id, options).then(d => dispatch(projectSchema.didReturnFromServer(d)))
//     }
//
//   }
//
//   retrieveProject2() {
//     this.project = new ProjectRedux(this.store, this.props.client, this.store.getState(), this.props.id);
//     this.project.fetch(this.store, this.props.client);
//     this.project.fetch(this.store, this.props.client, {readme: true});
//   }
//
//   mapStateToProps(state, ownProps) {
//     // Display properties
//     // const displayId = state.core.displayId;
//     // const internalId = state.core.id || ownProps.match.params.id;
//     // const visibilityLevel = state.visibility.level;
//     // const externalUrl = state.core.external_url;
//     // const title = state.core.title || 'no title';
//     // const description = state.core.description || 'no description';
//     // const readmeText = state.data.readme.text;
//     // const lastActivityAt = state.core.last_activity_at;
//     const project = new Project(state);
//
//     // Routing properties
//     const baseUrl = ownProps.match.isExact ? ownProps.match.url.slice(0, -1) : ownProps.match.url;
//     const overviewUrl = `${baseUrl}/`;
//     const kusUrl = `${baseUrl}/kus`;
//     const kuUrl = `${baseUrl}/kus/:kuIid(\\d+)`;
//     const notebooksUrl = `${baseUrl}/notebooks`;
//     const notebookUrl = `${baseUrl}/notebooks/:notebookPath`;
//     const kuList = <Ku.List key="kus" projectId={internalId} {...ownProps} client={ownProps.client} />
//     const kuView = (p) => <Ku.View key="ku" projectId={internalId}
//                                    kuIid={p.match.params.kuIid} {...p} client={ownProps.client} />
//     /* TODO Should we handle each type of file or just have a generic project files viewer? */
//     const notebookView = (p) => <Notebook.Show key="notebook"
//                                                projectId={internalId}
//                                                path={`notebooks/${p.match.params.notebookPath}`}
//                                                client={ownProps.client} {...p} />;
//     return {title, description, displayId, internalId, visibilityLevel,
//       externalUrl, readmeText, lastActivityAt,
//       overviewUrl,
//       kusUrl, kuList, kuUrl, kuView,
//       notebooksUrl, notebookUrl, notebookView}
//   }
//
//   render() {
//     const VisibleProjectView = connect(this.mapStateToProps)(Present.ProjectView);
//     return (
//       <Provider key="view" store={this.store}>
//         <VisibleProjectView
//           client={this.props.client}
//           match={this.props.match}
//         />
//       </Provider>)
//   }
// }
