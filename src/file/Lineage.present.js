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

import graphlib from 'graphlib';
import dagreD3 from 'dagre-d3';
import * as d3 from 'd3';

import { Link}  from 'react-router-dom';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faFile from '@fortawesome/fontawesome-free-solid/faFile';
import faGitlab from '@fortawesome/fontawesome-free-brands/faGitlab';
import { Card, CardHeader, CardBody, UncontrolledTooltip, Badge } from 'reactstrap';

import {  JupyterNotebook } from './File.container';

import './Lineage.css';

function getNodeLabel(node) {
  const commitShaShort = node.commitSha.slice(0, 8)
  if (node.type === 'blob') return `${node.filePath} (${commitShaShort})`
  if (node.type === 'commit') return `${node.label} (${commitShaShort})`
}

function nodeIdToClass(nodeId, centralNode) {
  return (nodeId === centralNode) ? 'central' : 'normal'
}

class FileLineageGraph extends Component {
  constructor(props) {
    super(props);
    this._vizRoot = null;
  }

  subGraph() {
    const graph = this.props.graph;

    const subGraph = new graphlib.Graph()
      .setGraph({})
      .setDefaultEdgeLabel(function(){ return {}; });

    graph.nodes.forEach(node => {
      if (node.id.includes(this.props.path)) {
        graph.centralNode = node.id;
      }
    })

    if (graph.centralNode == null) {
      subGraph.setNode("0", {id: "0", label: "No lineage information." });
    } else {
      graph.nodes.forEach(n => {
        subGraph.setNode(n.id, {
          id: n.id,
          label: getNodeLabel(n),
          class: nodeIdToClass(n.id, graph.centralNode)
        });
      });
      graph.edges.forEach(e => { subGraph.setEdge(e.source, e.target)});
    }
    return subGraph
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
    const isLFS = this.props.hashElement ? this.props.hashElement.isLfs : false;
    const isLFSBadge = isLFS ? 
      <Badge className="lfs-badge" color="light">LFS</Badge> : null;

    let buttonFile = this.props.filePath !== undefined ? 
      <span>
        <UncontrolledTooltip placement="top" target="TooltipFileView">
          File View
        </UncontrolledTooltip>
        <Link to={this.props.filePath} id="TooltipFileView">
          <FontAwesomeIcon className="icon-link" icon={faFile} id="TooltipFileView"/> 
        </Link>
      </span>
      : null;

    let buttonGit = 
    <span>
      <UncontrolledTooltip placement="top" target="TooltipGitlabView">
          Open in GitLab
      </UncontrolledTooltip>
      <a href={externalFileUrl} role="button" target="_blank" id="TooltipGitlabView"
        rel="noreferrer noopener"><FontAwesomeIcon className="icon-link" icon={faGitlab} /></a>
    </span>

    let buttonJupyter = this.props.filePath.endsWith(".ipynb") ? 
      <JupyterNotebook
        key="notebook-button"
        justButton={true}
        filePath={this.props.filePath}
        notebook={this.props.notebook}
        accessLevel={this.props.accessLevel}
        {...this.props}
      /> : null; 


    return <Card>
      <CardHeader className="align-items-baseline">
        {isLFSBadge}
        {this.props.path}
        <span className="caption align-baseline">&nbsp;Lineage and usage</span>
        <div className="float-right" >
          <span>{buttonJupyter}</span>
          <span>{buttonGit}</span>
          <span>{buttonFile}</span>
        </div>
      </CardHeader>
      <CardBody className="scroll-x">
        {graph}
      </CardBody>
    </Card>
  }
}

export { FileLineage };
