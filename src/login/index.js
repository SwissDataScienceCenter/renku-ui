import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { parse } from 'qs'


class Login extends Component {
  // We first login with gitlab to get an API token and then with keycloak.
  // The login with keycloak does not maintain the path for now.
  render() {
    if (!this.props.cookies.get('gitlab_token')) {
      console.log(this.props.params)
      window.location = this.props.params.GITLAB_URL +
        '/oauth/authorize?' +
        `client_id=${this.props.params.GITLAB_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(this.props.params.BASE_URL + '/login/redirect/gitlab')}&` +
        'response_type=token&' +
        'state=';
      return <p>logging in with gitlab</p>;
    }
  }
}

class Logout extends Component {
  render() {
    this.props.cookies.remove('gitlab_token');
    return <p>logging out</p>
  }
}

class GitlabRedirect extends Component {
  render() {
    const urlParams = parse(this.props.location.hash.match(/#(.*)/)[1]);
    this.props.cookies.set('gitlab_token', urlParams.access_token, { path: '/' });
    return <Redirect to="/"/>
  }
}

export default { GitlabRedirect, Logout, Login };
