/*!
 * Copyright 2018 - Swiss Data Science Center (SDSC)
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

import { Row, Col } from 'reactstrap';
import graphlib from 'graphlib';
import dagreD3 from 'dagre-d3';
import * as d3 from 'd3';

import { ExternalLink } from '../utils/UIComponents'

import './Lineage.css';


function nodeIdToPath(nodeId) { return nodeId.split(',')[1].slice(2, -2) }

function nodeIdToSha(nodeId) { return (nodeId == null) ? "unknown" : nodeId.split(',')[0].slice(2, 10) }

function nodeIdToClass(nodeId, centralNode) {
  return (nodeId === centralNode) ? 'central': 'normal'
}

class FileLineageGraph extends Component {
  constructor(props) {
    super(props);
    this._vizRoot = null;
  }

  graph() { return this.props.graph }

  subGraph() {
    const subGraph = new graphlib.Graph()
      .setGraph({})
      .setDefaultEdgeLabel(function() { return {}; });

    const {nodes, edges, centralNode} = this.nodesAndEdges();
    if (nodes.length < 2) {
      subGraph.setNode(centralNode, {id: centralNode, label: `Introduced in commit ${nodeIdToSha(centralNode)}` });
    } else {
      nodes.forEach(n => {
        subGraph.setNode(n, {id: n, label: nodeIdToPath(n), class: nodeIdToClass(n, centralNode)})
      });
      edges.forEach(e => { subGraph.setEdge(e) });
    }
    return subGraph
  }

  allPredecessors(centralNode, accum={}) {
    const graph = this.graph();
    const directPreds = graph.predecessors(centralNode);
    directPreds.map(p => this.allPredecessors(p, accum));
    directPreds.forEach(p => { accum[p] = p });
    return accum;
  }

  allSuccessors(centralNode, accum={}) {
    const graph = this.graph();
    const directSuccs = graph.successors(centralNode);
    directSuccs.map(p => this.allSuccessors(p, accum));
    directSuccs.forEach(p => { accum[p] = p });
    return accum;
  }

  nodesAndEdges() {
    // Filter the graph to what is reachable from the central element
    const graph = this.graph();
    let centralNode = graph.nodes().filter(n => nodeIdToPath(n) === this.props.path);
    if (centralNode.length < 1) return {nodes: [], edges: [], centralNode: null}
    centralNode = centralNode[0];
    const centralClosure = this.allPredecessors(centralNode);
    this.allSuccessors(centralNode, centralClosure);
    centralClosure[centralNode] = centralNode;
    const nodes = Object.keys(centralClosure)
    const edges =
      graph.edges()
        .filter(e => (centralClosure[e.v] != null) && (centralClosure[e.w] != null));
    return {nodes, edges, centralNode};
  }

  componentDidMount() {
    this.renderD3();
  }

  componentDidUpdate() {
    this.renderD3();
  }

  renderD3() {
    // Create the input graph
    const g = this.subGraph()
    // Create the renderer
    const render = new dagreD3.render();

    // Set up an SVG group so that we can translate the final graph.
    const svg = d3.select(this._vizRoot).select('svg'),
      svgGroup = svg.append('g');

    // Run the renderer. This is what draws the final graph.
    render(d3.select('svg g'), g);

    // Center the graph
    svg.attr('width', g.graph().width + 40);
    svgGroup.attr('transform', 'translate(20, 20)');
    svg.attr('height', g.graph().height + 40);
  }

  render() {
    return <div ref={(r) => this._vizRoot = r}><svg><g></g></svg></div>
  }
}

class FileLineage extends Component {
  render() {
    const graphObj = this.props.graph;
    const graph = (graphObj) ?
      <FileLineageGraph path={this.props.path} graph={graphObj} /> :
      (this.props.error) ?
        <p>{this.props.error}</p> :
        <p>Loading...</p>;
    const externalUrl = this.props.externalUrl;
    const externalFileUrl = `${externalUrl}/blob/master/${this.props.path}`;
    return [
      <Row key="header">
        <Col sm={8}>
          <div className="d-flex flex-row align-items-baseline">
            <div><h3><em>{this.props.path}</em></h3></div>
            <div className="caption">&nbsp;lineage and usage</div>
          </div>
        </Col>
        <Col sm={4}>
          <p className="text-sm-right">
            <ExternalLink url={externalFileUrl} title="View in GitLab" />
          </p>
        </Col>
      </Row>,
      <Row key="graph"><Col>{graph}</Col></Row>
    ]
  }
}

export { FileLineage };
