import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import './App.css';

class App extends Component {
  render() {
    return (
      <Container fluid={true}>
        <header className="App-header">
          <h1 className="App-title">Welcome to SDSC/RENGA</h1>
        </header>
        <Row>
          <Col sm={{size: 4, offset: 4}}>
            <p className="App-intro">
              To get started, edit <code>src/App.js</code> and save to reload.
            </p>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
