import React, { Component } from 'react';
import { parse } from 'qs'


class Login extends Component {
  render() {
    // TODO: User should be redirected to his current page by adding meaningful state here...
    window.location = this.props.params.GITLAB_URL +
      '/oauth/authorize?' +
      `client_id=${this.props.params.GITLAB_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(this.props.params.BASE_URL + '/login/redirect/gitlab')}&` +
      'response_type=token&' +
      'state=';
    return <p>logging in with gitlab</p>;
  }
}


// TODO: Currently, the user is logged out neither from gitlab nor from keycloak. Change
// TODO: this as soon as we're talking to the gateway directly.
class Logout extends Component {
  render() {
    this.props.cookies.remove('gitlab_token');
    window.location = this.props.params.BASE_URL;
    return <p>logging out</p>;
  }
}

class GitlabRedirect extends Component {
  render() {
    const urlParams = parse(this.props.location.hash.match(/#(.*)/)[1]);
    this.props.cookies.set('gitlab_token', urlParams.access_token, { path: '/' });
    // TODO: User should be redirected to his current page.
    // TODO: For the moment, we do a hard reload here. Replace this by just updating application state properly.
    window.location = this.props.params.BASE_URL;
    return null;
  }
}

export default { GitlabRedirect, Logout, Login };
