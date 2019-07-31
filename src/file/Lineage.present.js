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

import { Link }  from 'react-router-dom';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faInfoCircle, faFile } from '@fortawesome/fontawesome-free-solid'
import faGitlab from '@fortawesome/fontawesome-free-brands/faGitlab';
import { Card, CardHeader, CardBody, UncontrolledTooltip, Badge, Button, Alert, Progress } from 'reactstrap';

import { Loader } from '../utils/UIComponents';
import { LaunchJupyter } from './File.container';
import { GraphIndexingStatus } from '../project/Project';

import './Lineage.css';

function cropLabelStart(limit, label){
  if(label.length > limit)
    return "..."+label.substr(label.length-limit)
  return label;
}

function getNodeLabel(node, NODE_COUNT, projectPath) {
  if (node.type === 'commit') {
    const stringArray = node.label.split(" ");
    const LABEL_LIMIT = 20;
    const label= stringArray.length > 3 ?
      cropLabelStart(LABEL_LIMIT, stringArray[2])+"<br/>"+cropLabelStart(LABEL_LIMIT, stringArray[3])
      : cropLabelStart(LABEL_LIMIT, stringArray[0])+" "+cropLabelStart(LABEL_LIMIT, stringArray[1])
    return '<text><tspan xml:space="preserve" dy="1em" x="1">'+label+'</tspan></text>'
  }

  if(node.type === 'blob') {
    const LABEL_LIMIT = NODE_COUNT > 15 ? 20  : 40;
    const ref= projectPath+'/files/lineage'+node.filePath
    return '<text><tspan xml:space="preserve" dy="1em" x="1" data-href='+ref+'>'
      +cropLabelStart(LABEL_LIMIT, node.filePath)+
      '</tspan></text>';
  }
}

function nodeToClass(node, centralNode, label) {
  const nodeId = node.id;
  const nodeType = node.type;
  const FORMATS = {'py': true , 'r': true, 'ipynb': true}
  const nodeClasses = [];

  if (nodeId === centralNode)
    nodeClasses.push('central');
  else
    nodeClasses.push('normal');
  nodeClasses.push(nodeType);
  if (nodeType === "commit" && label.includes("\n"))
    nodeClasses.push('doubleLine');

  if (node.type === 'blob') {
    if (node.filePath.includes('.') && FORMATS[node.filePath.split('.').pop()])
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
      .setDefaultEdgeLabel(function(){ return {}; });

    graph.nodes.forEach(node => {
      if (node.id.endsWith(`/${this.props.path}`)) {
        graph.centralNode = node.id;
      }
    })

    graph.nodes.forEach(n => {
      const label = getNodeLabel(n, NODE_COUNT, this.props.projectPath);
      subGraph.setNode(n.id, {
        id: n.id,
        labelType:'html',
        label,
        class: nodeToClass(n, graph.centralNode, label),
        shape: n.type === "commit" ? "diamond" : "rect"
      });
    });
    graph.edges.forEach(e => { subGraph.setEdge(e.source, e.target)});
    
    return subGraph
  }

  componentDidMount() {
    if (this.subGraph()._nodeCount >1)
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
    const svg = d3.select(this._vizRoot).select('svg');
    let svgGroup;
    if(this.appended === false){
      svgGroup = svg.append('g');
      this.appended = true;
    } else{  svgGroup= svg.select('g')}
    
    const history = this.props.history;
    
    render(svgGroup, g);

    // Set up zoom support
    const zoom = d3.zoom()
      .on("zoom", function() {
        svgGroup.attr("transform", d3.event.transform);
      });
    svg.call(zoom);

    d3.selectAll('g.node').filter((d,i)=>{ return this.hasLink(d, this.props.graph.centralNode)})
      .select("tspan").on("mouseover", function() {
        d3.select(this).style("cursor","pointer").attr('r', 25)
          .style("text-decoration-line", "underline");
      })
      .on("mouseout", function() {
        d3.select(this).attr('r', 25)
          .style("text-decoration-line", "unset");
      })
      .on("click", function(){
        history.push(d3.select(this).attr("data-href"));
      });
    
    // Center the graph
    const bbox = document.getElementsByClassName('graphContainer')[0].lastChild.getBBox();
    svg.attr('viewBox', '0 0 '+bbox.width+' '+bbox.height)

    d3.select("#zoom_in").on("click", function() {
      zoom.scaleBy(svg.transition().duration(750), 1.5);
    });
    d3.select("#zoom_out").on("click", function() {
      zoom.scaleBy(svg.transition().duration(750), 0.75);
    });

    var initialScale = 0.80;
    svg.call(zoom.transform, 
      d3.zoomIdentity.translate((bbox.width - g.graph().width * initialScale) / 2, 20)
        .scale(initialScale));
  }

  render() {
    return this.subGraph()._nodeCount >1 ?
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
      <LaunchJupyter {...this.props} /> :
      null;

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
        {graph}
      </CardBody>
    </Card>
  }
}

export { FileLineage };
