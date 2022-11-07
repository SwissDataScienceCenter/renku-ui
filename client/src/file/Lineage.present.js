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

import React, { Component } from "react";
import { Card, CardHeader, CardBody, Badge } from "reactstrap";
import graphlib from "graphlib";
import dagreD3 from "dagre-d3";
import * as d3 from "d3";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { faGitlab } from "@fortawesome/free-brands-svg-icons";
import KnowledgeGraphStatus from "./KnowledgeGraphStatus.container";
import { GraphIndexingStatus } from "../project/Project";
import { JupyterButton } from "./index";
import { formatBytes } from "../utils/helpers/HelperFunctions";
import { FileAndLineageSwitch } from "./FileAndLineageComponents";

import "./Lineage.css";
import { ExternalIconLink } from "../utils/components/ExternalLinks";
import { Clipboard } from "../utils/components/Clipboard";

function cropLabelStart(limit, label) {
  if (label.length > limit)
    return "<...>" + label.substr(label.length - limit);
  return label;
}

function getNodeLabel(node, NODE_COUNT, lineagesUrl) {
  if (node.type === "ProcessRun") {
    const BREAKING_LINE = "<br>";
    const MISSING_PIECES = "<...>";
    const LABEL_LIMIT = 30;

    const stringCleaned = "" + node.label.replace(/ +(?= )/g, ""); // remove double space, prevent crash on empty str
    const stringArray = stringCleaned.split(" "); // split on spaces
    const smallerArray = stringArray.length > 4 ? // remove when too many arguments
      stringArray.slice(0, 1).concat(MISSING_PIECES).concat(stringArray.slice(stringArray.length - 3)) :
      stringArray;
    const shortenArray = smallerArray.map(e => cropLabelStart(LABEL_LIMIT, e.trim())); // crop long labels
    const label = shortenArray.join(BREAKING_LINE); // break line at each arg

    return '<text><tspan xml:space="preserve" dy="1em" x="1">' + label + "</tspan></text>";
  }

  if (node.type === "Directory" || node.type === "File") {
    const LABEL_LIMIT = NODE_COUNT > 15 ? 20 : 40;
    const ref = `${lineagesUrl}/${node.location}`;
    return '<text><tspan xml:space="preserve" dy="1em" x="1" data-href=' + ref + ">"
      + cropLabelStart(LABEL_LIMIT, node.location) +
      "</tspan></text>";
  }
}

function nodeToClass(node, currentNodeId, label) {
  const nodeId = node.id;
  const nodeType = node.type;
  // see also File.container.js > CODE_EXTENSIONS
  const CODE_EXTENSIONS = [
    "bat", "jl", "js", "py", "r", "rmd", "rs", "scala", "sh", "ts",
    "c", "cc", "cxx", "cpp", "h", "hh", "hxx", "hpp", // C++
    "f", "for", "ftn", "fpp", "f90", "f95", "f03", "f08" // Fortran
  ];
  const FORMATS = { "ipynb": true };
  CODE_EXTENSIONS.forEach(e => FORMATS[e] = true);
  const nodeClasses = [];

  if (nodeId === currentNodeId)
    nodeClasses.push("central");
  else
    nodeClasses.push("normal");
  nodeClasses.push(nodeType);
  if (nodeType === "commit" && label.includes("\n"))
    nodeClasses.push("doubleLine");

  if (node.type === "Directory" || node.type === "File") {
    if (node.location.includes(".") && FORMATS[node.location.split(".").pop().toLowerCase()])
      nodeClasses.push("code");
    else
      nodeClasses.push("data");
  }
  else { nodeClasses.push("workflow"); }

  return nodeClasses.join(" ");
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
      .setGraph({ nodesep: 20, ranksep: 80, marginx: 20, marginy: 20 }) // eslint-disable-line
      .setDefaultEdgeLabel(function () { return {}; });

    graph.nodes.forEach(n => {
      const label = getNodeLabel(n, NODE_COUNT, this.props.lineagesUrl);
      subGraph.setNode(n.id, {
        id: n.id,
        labelType: "html",
        label,
        class: nodeToClass(n, this.props.currentNode.id, label),
        shape: n.type === "ProcessRun" ? "diamond" : "rect"
      });
    });
    graph.edges.forEach(e => { subGraph.setEdge(e.source, e.target); });

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
    const g = this.subGraph();
    // Create the renderer
    const render = new dagreD3.render();

    // Set up an SVG group so that we can translate the final graph.
    const svg = d3.select(this._vizRoot).select("svg");
    let svgGroup;
    if (this.appended === false) {
      svgGroup = svg.append("g");
      this.appended = true;
    }
    else {
      svgGroup = svg.select("g");
    }

    const history = this.props.history;

    render(svgGroup, g);

    // Set up zoom support
    const zoom = d3.zoom()
      .on("zoom", function () {
        svgGroup.attr("transform", d3.event.transform);
      });
    svg.call(zoom);

    d3.selectAll("g.node").filter((d) => { return this.hasLink(d, this.props.currentNode.id); })
      .select("tspan").on("mouseover", function () {
        d3.select(this).style("cursor", "pointer").attr("r", 25)
          .style("text-decoration-line", "underline");
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 25)
          .style("text-decoration-line", "unset");
      })
      .on("click", function () {
        history.push(d3.select(this).attr("data-href"));
      });

    // Center the graph
    const bBox = document.getElementsByClassName("graphContainer")[0].lastChild.getBBox();
    svg.attr("viewBox", "0 0 " + bBox.width + " " + bBox.height);

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
      <div>No lineage information.</div>;
  }
}

class FileLineage extends Component {
  render() {
    const { progress, currentNode, filePath, graph } = this.props;

    if (progress == null
      || progress === GraphIndexingStatus.NO_WEBHOOK
      || progress === GraphIndexingStatus.NO_PROGRESS
      || (progress >= GraphIndexingStatus.MIN_VALUE && progress < GraphIndexingStatus.MAX_VALUE)
    ) {
      return <KnowledgeGraphStatus
        fetchGraphStatus={this.props.fetchGraphStatus}
        fetchAfterBuild={this.props.retrieveGraph}
        createGraphWebhook={this.props.createGraphWebhook}
        maintainer={this.props.maintainer}
        forked={this.props.forked}
        progress={this.props.progress}
      />;
    }

    const graphComponent = (graph) ?
      <FileLineageGraph
        path={this.props.path}
        graph={graph}
        currentNode={currentNode}
        lineagesUrl={this.props.lineagesUrl}
        history={this.props.history} /> :
      (this.props.error) ?
        <div>No lineage information.</div> :
        <p>Loading...</p>;
    const externalUrl = this.props.externalUrl;
    const externalFileUrl = `${externalUrl}/blob/master/${this.props.path}`;
    const isLFS = this.props.hashElement ? this.props.hashElement.isLfs : false;
    const isLFSBadge = isLFS ?
      <Badge className="lfs-badge" color="white">LFS</Badge> : null;

    let buttonFile = filePath !== undefined && currentNode.type !== "Directory" ?
      <FileAndLineageSwitch
        insideFile={false}
        history={this.props.history}
        switchToPath={filePath}
      />
      :
      null;

    let buttonGit = <ExternalIconLink tooltip="Open in GitLab" icon={faGitlab} to={externalFileUrl} />;

    let buttonJupyter = null;
    if (filePath.endsWith(".ipynb")) {
      buttonJupyter = (
        <JupyterButton {...this.props}
          file={{ file_path: this.props.path }}
          projectPath={this.props.projectPathOnly} />
      );
    }

    const fileInfo = this.props.filesTree?.hash && this.props.gitFilePath ?
      this.props.filesTree.hash[this.props.gitFilePath] :
      null;
    // Do not show the download button if it's a folder
    const buttonDownload = fileInfo && fileInfo.type === "tree" ?
      null :
      (
        <ExternalIconLink
          tooltip="Download File"
          icon={faDownload}
          to={`${this.props.externalUrl}/-/raw/master/${this.props.path}?inline=false`}
        />
      );

    return <Card className="border-rk-light">
      <CardHeader className="d-flex align-items-center bg-white justify-content-between pe-3 ps-3">
        <div className="d-flex align-items-end">
          {isLFSBadge}
          <strong>{this.props.path}</strong>
        &nbsp;
          {this.props.fileSize ? <span><small> {formatBytes(this.props.fileSize)}</small></span> : null}
        &nbsp;
          <span className="fileBarIconButton"><Clipboard clipboardText={this.props.path} /></span>
        &nbsp;
        </div>

        <div className="d-flex align-items-end">
          <span className="fileBarIconButton">{buttonDownload}</span>
          <span className="fileBarIconButton">{buttonJupyter}</span>
          <span className="fileBarIconButton">{buttonGit}</span>
          <span className="fileBarIconButton ms-2">{buttonFile}</span>
        </div>
      </CardHeader>
      <CardBody className="scroll-x">
        {graphComponent}
      </CardBody>
    </Card>;
  }
}

export { FileLineage };
