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
import { Card, CardHeader, CardBody, Badge } from 'reactstrap';
import graphlib from 'graphlib';
import dagreD3 from 'dagre-d3';
import * as d3 from 'd3';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { faGitlab } from '@fortawesome/free-brands-svg-icons';

import KnowledgeGraphStatus from './KnowledgeGraphStatus.container';
import { GraphIndexingStatus } from '../project/Project';
import { JupyterButton } from './index';
import { ExternalIconLink, IconLink } from '../utils/UIComponents';

import './Lineage.css';

function cropLabelStart(limit, label) {
  if (label.length > limit)
    return "..." + label.substr(label.length - limit)
  return label;
}

function getNodeLabel(node, NODE_COUNT, lineagesUrl) {
  if (node.type === "ProcessRun") {
    const stringArray = node.label.split(" ");
    const LABEL_LIMIT = 20;
    const label = stringArray.length > 3 ?
      cropLabelStart(LABEL_LIMIT, stringArray[2]) + "<br/>" + cropLabelStart(LABEL_LIMIT, stringArray[3])
      : cropLabelStart(LABEL_LIMIT, stringArray[0]) + " " + cropLabelStart(LABEL_LIMIT, stringArray[1])
    return '<text><tspan xml:space="preserve" dy="1em" x="1">' + label + '</tspan></text>'
  }

  if (node.type === "Directory" || node.type === "File") {
    const LABEL_LIMIT = NODE_COUNT > 15 ? 20 : 40;
    const ref = `${lineagesUrl}/${node.location}`
    return '<text><tspan xml:space="preserve" dy="1em" x="1" data-href=' + ref + '>'
      + cropLabelStart(LABEL_LIMIT, node.location) +
      '</tspan></text>';
  }
}

function nodeToClass(node, currentNodeId, label) {
  const nodeId = node.id;
  const nodeType = node.type;
  const FORMATS = { 'py': true, 'r': true, 'ipynb': true }
  const nodeClasses = [];

  if (nodeId === currentNodeId)
    nodeClasses.push('central');
  else
    nodeClasses.push('normal');
  nodeClasses.push(nodeType);
  if (nodeType === "commit" && label.includes("\n"))
    nodeClasses.push('doubleLine');

  if (node.type === "Directory" || node.type === "File") {
    if (node.location.includes('.') && FORMATS[node.location.split('.').pop()])
      nodeClasses.push('code');
    else
      nodeClasses.push('data');
  } else
    nodeClasses.push('workflow');

  return nodeClasses.join(" ")
}

class FileLineageGraph extends Component {
  constructor(props) {
    super(props);
    this._vizRoot = null;
  }

  componentDidMount() {
    if (this.subGraph()._nodeCount > 1)
      this.renderD3();
  }

  subGraph() {
    const graph = this.props.graph;
    const NODE_COUNT = this.props.graph.length;
    const subGraph = new graphlib.Graph()
      .setGraph({
        nodesep: 20,
        ranksep: 80,
        marginx: 20,
        marginy: 20,
      })
      .setDefaultEdgeLabel(function () { return {}; });

    graph.nodes.forEach(n => {
      const label = getNodeLabel(n, NODE_COUNT, this.props.lineagesUrl);
      subGraph.setNode(n.id, {
        id: n.id,
        labelType: 'html',
        label,
        class: nodeToClass(n, this.props.currentNode.id, label),
        shape: n.type === "ProcessRun" ? "diamond" : "rect"
      });
    });
    graph.edges.forEach(e => { subGraph.setEdge(e.source, e.target) });

    return subGraph;
  }

  hasLink(nodeId, currentNodeId) {
    return this.props.graph.nodes
      .filter(function (node) {
        return (node.id === nodeId && node.id !== currentNodeId && (node.type === "Directory" || node.type === "File"));
      })[0];
  }

  renderD3() {
    // Create the input graph
    const g = this.subGraph()
    // Create the renderer
    const render = new dagreD3.render();

    // Set up an SVG group so that we can translate the final graph.
    const svg = d3.select(this._vizRoot).select('svg');
    let svgGroup;
    if (this.appended === false) {
      svgGroup = svg.append('g');
      this.appended = true;
    }
    else {
      svgGroup = svg.select('g')
    }

    const history = this.props.history;

    render(svgGroup, g);

    // Set up zoom support
    const zoom = d3.zoom()
      .on("zoom", function () {
        svgGroup.attr("transform", d3.event.transform);
      });
    svg.call(zoom);

    d3.selectAll('g.node').filter((d, i) => { return this.hasLink(d, this.props.currentNode.id) })
      .select("tspan").on("mouseover", function () {
        d3.select(this).style("cursor", "pointer").attr('r', 25)
          .style("text-decoration-line", "underline");
      })
      .on("mouseout", function () {
        d3.select(this).attr('r', 25)
          .style("text-decoration-line", "unset");
      })
      .on("click", function () {
        history.push(d3.select(this).attr("data-href"));
      });

    // Center the graph
    const bbox = document.getElementsByClassName('graphContainer')[0].lastChild.getBBox();
    svg.attr('viewBox', '0 0 ' + bbox.width + ' ' + bbox.height);

    d3.select("#zoom_in").on("click", function () {
      zoom.scaleBy(svg.transition().duration(750), 1.5);
    });
    d3.select("#zoom_out").on("click", function () {
      zoom.scaleBy(svg.transition().duration(750), 0.75);
    });

    const initialScale = 0.90;
    svg.call(zoom.transform, d3.zoomIdentity.scale(initialScale));
  }

  render() {
    return this.subGraph()._nodeCount > 1 ?
      <div className="graphContainer" ref={(r) => this._vizRoot = r}>
        <div className="float-right zoomButtons">
          <button className="btn btn-light btn-group-left" id="zoom_in">+</button>
          <button className="btn btn-light btn-group-right" id="zoom_out">-</button>
        </div>
        <svg><g></g></svg>
      </div>
      :
      <div>No lineage information.</div>
  }
}

class FileLineage extends Component {
  render() {
    const { progress, currentNode, filePath, graph } = this.props;

    if (progress == null
      || progress === GraphIndexingStatus.NO_WEBHOOK
      || progress === GraphIndexingStatus.NO_PROGRESS
      || (progress >= GraphIndexingStatus.MIN_VALUE && progress < GraphIndexingStatus.MAX_VALUE)
    )
      return <KnowledgeGraphStatus
        fetchGraphStatus={this.props.fetchGraphStatus}
        retrieveGraph={this.props.retrieveGraph}
        createGraphWebhook={this.props.createGraphWebhook}
        maintainer={this.props.maintainer}
        forked={this.props.forked}
        progress={this.props.progress}
      />;

    const graphComponent = (graph) ?
      <FileLineageGraph
        path={this.props.path}
        graph={graph}
        currentNode={currentNode}
        lineagesUrl={this.props.lineagesUrl}
        history={this.props.history} /> :
      (this.props.error) ?
        <p>{this.props.error}</p> :
        <p>Loading...</p>;
    const externalUrl = this.props.externalUrl;
    const externalFileUrl = `${externalUrl}/blob/master/${this.props.path}`;
    const isLFS = this.props.hashElement ? this.props.hashElement.isLfs : false;
    const isLFSBadge = isLFS ?
      <Badge className="lfs-badge" color="light">LFS</Badge> : null;

    let buttonFile = filePath !== undefined && currentNode.type !== "Directory" ?
      <IconLink tooltip="File View" icon={faFile} to={filePath} /> :
      null;

    let buttonGit = <ExternalIconLink tooltip="Open in GitLab" icon={faGitlab} to={externalFileUrl} />

    let buttonJupyter = null;
    if (filePath.endsWith(".ipynb"))
      buttonJupyter = (
        <JupyterButton {...this.props}
          file={{ file_path: this.props.path }}
          projectPath={this.props.projectPathOnly} />
      );

    return <Card>
      <CardHeader className="align-items-baseline">
        {isLFSBadge}
        {this.props.path}
        <span className="caption align-baseline">&nbsp;Lineage and usage</span>
        <div className="float-right" >
          {buttonJupyter}
          <span>{buttonGit}</span>
          <span>{buttonFile}</span>
        </div>
      </CardHeader>
      <CardBody className="scroll-x">
        {graphComponent}
      </CardBody>
    </Card>
  }
}

export { FileLineage };
