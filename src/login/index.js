import React, { Component } from 'react';

// TODO: Find a way to access the previous route (before login) for a more meaningful redirect url (or make
// TODO: this a non-component).
class Login extends Component {
  render() {
    window.location =
      `${this.props.params.GATEWAY_URL}/auth/login?redirect_url=${encodeURIComponent(this.props.params.BASE_URL)}`;
    return <p>logging in</p>;
  }
}

class Logout extends Component {
  render() {
    this.props.cookies.remove('access_token');
    this.props.cookies.remove('refresh_token');
    this.props.cookies.remove('id_token');

    window.location = `${this.props.params.GATEWAY_URL}/auth/logout?` +
      `redirect_url=${encodeURIComponent(this.props.params.BASE_URL)}`;
    return <p>logging out</p>;
  }
}


export { Logout, Login };
