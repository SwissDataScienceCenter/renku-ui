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
import { faInfoCircle, faFile } from '@fortawesome/fontawesome-free-solid'
import faGitlab from '@fortawesome/fontawesome-free-brands/faGitlab';
import { Card, CardHeader, CardBody, UncontrolledTooltip, Badge, Button, Alert, Progress } from 'reactstrap';

import { Loader } from '../utils/UIComponents';
import { JupyterNotebook } from './File.container';
import { GraphIndexingStatus } from '../project/Project';

import './Lineage.css';

function cropLabelStart(limit, label){
  if(label.length > limit)
    return "..."+label.substr(label.length-limit)
  return label;
}

function getNodeLabel(node, NODE_COUNT) {
  if (node.type === 'commit') {
    const stringArray = node.label.split(" ");
    const LABEL_LIMIT = 20;
    return stringArray.length > 3 ?
      cropLabelStart(LABEL_LIMIT, stringArray[2])+"\n"+cropLabelStart(LABEL_LIMIT, stringArray[3])
      : cropLabelStart(LABEL_LIMIT, stringArray[0])+" "+cropLabelStart(LABEL_LIMIT, stringArray[1])
  }

  if(node.type === 'blob') {
    const LABEL_LIMIT = NODE_COUNT > 15 ? 20  : 40;
    return cropLabelStart(LABEL_LIMIT, node.filePath);
  }
}


function nodeIdToClass(nodeId, centralNode, nodeType, label) {
  let nodeClass = (nodeId === centralNode) ? 'central' : 'normal';
  nodeClass+=" "+nodeType;
  if(nodeType === "commit" && label.includes("\n"))
    nodeClass+=" doubleLine";
  return nodeClass
}

function getNodeBorder(node){
  const FORMATS = {'py': true , 'r':true, 'ipynb':true}
  return node.type === 'blob'
      && node.filePath.includes('.')
      && FORMATS[node.filePath.split('.').pop()]
    ? "stroke-width: 1.5px; stroke: #333;":  "stroke: unset"
}

class FileLineageGraph extends Component {
  constructor(props) {
    super(props);
    this._vizRoot = null;
  }

  subGraph() {
    const graph = this.props.graph;
    const NODE_COUNT = this.props.graph.length;
    const subGraph = new graphlib.Graph()
      .setGraph({
        nodesep: 20,
        ranksep: 80,
        marginx: 20,
        marginy: 20
      })
      .setDefaultEdgeLabel(function(){ return {}; });

    graph.nodes.forEach(node => {
      if (node.id.endsWith(`/${this.props.path}`)) {
        graph.centralNode = node.id;
      }
    })

    if (graph.centralNode == null) {
      subGraph.setNode("0", {id: "0", label: "No lineage information." });
    } else {
      graph.nodes.forEach(n => {
        subGraph.setNode(n.id, {
          id: n.id,
          label: getNodeLabel(n, NODE_COUNT),
          class: nodeIdToClass(n.id, graph.centralNode, n.type, getNodeLabel(n, NODE_COUNT)),
          shape: n.type === "commit" ? "diamond" : "rect",
          style: getNodeBorder(n)
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

  hasLink(nodeId, centralNode){
    return this.props.graph.nodes
      .filter(function(node) { return (node.id === nodeId && node.id !== centralNode && node.type === "blob") })[0];
  }

  renderD3() {
    // Create the input graph
    const g = this.subGraph()
    // Create the renderer
    const render = new dagreD3.render();

    // Set up an SVG group so that we can translate the final graph.
    const svg = d3.select(this._vizRoot).select('svg'),
      svgGroup = svg.append('g');

    const history = this.props.history;
    const projectPath = this.props.projectPath;

    // Run the renderer. This is what draws the final graph.
    render(d3.select('svg g'), g);

    d3.selectAll('g.node').filter((d,i)=>{ return this.hasLink(d, this.props.graph.centralNode)})
      .on("mouseover", function() {
        d3.select(this).style("cursor","pointer").attr('r', 25)
          .style("text-decoration-line", "underline");
      })
      .on("mouseout", function() {
        d3.select(this).attr('r', 25)
          .style("text-decoration-line", "unset");
      })
      .on("click", function(){
        history.push(projectPath+'/files/lineage'+d3.select(this).text().split(' ')[0])
      });

    // Center the graph
    svg.attr('width', g.graph().width + 40);
    svgGroup.attr('transform', 'translate(20, 20)');
    svg.attr('height', g.graph().height + 40);
  }

  render() {
    return <div className="graphContainer" ref={(r) => this._vizRoot = r}><svg><g></g></svg></div>
  }
}

class FileLineage extends Component {
  render() {
    const {progress, webhookJustCreated} = this.props;
    if (progress == null) {
      return (
        <Loader />
      )
    }
    if (progress === GraphIndexingStatus.NO_WEBHOOK) {
      if (webhookJustCreated) {
        return (
          <Alert color="warning">
            Knowledge Graph activated! Lineage computation starting soon...
          </Alert>
        )
      }
      else {
        const action = this.props.maintainer ?
          <Button color="warning" onClick={this.props.createWebhook}>Activate Knowledge Graph</Button> :
          <span>You do not have sufficient rights, but a project owner can do this.</span>

        return (
          <Alert color="warning">
            Knowledge Graph integration must be activated to view the lineage.&nbsp;
            {action}
          </Alert>
        )
      }
    }
    else if (progress === GraphIndexingStatus.NO_PROGRESS) {
      let forkedInfo = null;
      if (this.props.forked) {
        forkedInfo = (
          <div>
            <br />
            <FontAwesomeIcon icon={faInfoCircle} /> <span className="font-italic">If you recenty forked
            this project, the graph integration will not finish until you create at least one commit.</span>
          </div>
        );
      }
      return (
        <div>
          <Alert color="primary">
            Please wait, Knowledge Graph integration recently triggered.
            {forkedInfo}
          </Alert>
          <Loader />
        </div>
      )
    }
    else if (progress >= GraphIndexingStatus.MIN_VALUE && progress < GraphIndexingStatus.MAX_VALUE) {
      return (
        <div>
          <Alert color="primary">
            <p>Knowledge Graph is building... {parseInt(progress)}%</p>
            <Progress value={progress} />
          </Alert>
        </div>
      )
    }

    const graphObj = this.props.graph;
    const graph = (graphObj) ?
      <FileLineageGraph
        path={this.props.path}
        graph={graphObj}
        projectPath={this.props.match.url}
        history={this.props.history}/> :
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
