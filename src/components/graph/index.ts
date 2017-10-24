/*
 * Copyright 2017 - Swiss Data Science Center (SDSC)
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

import Vue from 'vue'
import Component from 'vue-class-component'
import * as d3 from 'd3';

import {router} from '../../main'
import {loadVertices, loadEdges} from './load-graph'
import {PersistedVertex, DisplayVertex, PersistedEdge, DisplayEdge, Property,
    ScreenTransform, Coordinates, LinkCoordinates} from './elements'
import {icons} from './icons'
require('./graph.styl');

@Component({
    template: require('./graph.html')
})

export class GraphComponent extends Vue {

    vertices: DisplayVertex[] = [];
    vertexIds: string[] = [];
    edges: DisplayEdge[] = [];
    edgeIds: string[] = [];

    mounted() {
        this.updateGraphInfo()
    }

    updateGraphInfo() {
        // Use nested callbacks for the time being just to be sure all data has been loaded.
        loadVertices('./api/navigation/vertex', this.addVertex, () => {
            loadEdges('./api/navigation/edge', this.addEdge, () => {
                drawGraph(this.vertices, this.edges);
            })
        })
    }

    addEdge(edge: PersistedEdge): void {
        if (this.edgeIds.indexOf(`#e${edge.id}`) === -1) {
            this.edges.push(
                {
                    id: `n${edge.id}`,
                    label: `${edge.label}`,
                    source: `v${edge.from}`,
                    target: `v${edge.to}`,
                    display_name: `${edge.label.replace(/([^:]*):(.*)/, '$2')}`,
                    self: edge
                }
            );
            this.edgeIds.push(`v${edge.id}`);

            // Use this to temporarily enrich executions with the context that has produced them in order to construct
            // the correct url for this execution (full url should be part of the API response)
            if (this.edges[this.edges.length - 1].display_name === 'launch') {
                for (let source of this.vertices) {
                    if (source.id === this.edges[this.edges.length - 1].source) {
                        for (let target of this.vertices) {
                            if (target.id === this.edges[this.edges.length - 1].target) {
                                let contextUUID;
                                let executionUUID;
                                for (let prop of source.self.properties) {
                                    if (prop.key === 'deployer:context_id') {
                                        contextUUID = prop.values[0].value;
                                    }
                                }
                                for (let prop of target.self.properties) {
                                    if (prop.key === 'deployer:execution_id') {
                                        executionUUID = prop.values[0].value;
                                    }
                                }
                                target.detailUrl = `deploy/context/${contextUUID}/execution/${executionUUID}`;
                            }
                        }
                    }
                }
            }
        }
    }

    addVertex(vertex: PersistedVertex): void {
        if (this.vertexIds.indexOf(`#v${vertex.id}`) === -1) {
            this.vertices.push({
                id: `v${vertex.id}`,
                label: `${vertex.id}`,
                display_name: this.findDisplayName(vertex),
                detailUrl: null,
                self: vertex,
                collapsible: COLLAPSIBLE_TYPES.indexOf(vertex.types[0]) >= 0
            });
            this.vertexIds.push(`v${vertex.id}`);


            if (this.vertices[this.vertices.length - 1].self.types[0] === 'deployer:context') {
                for (let prop of this.vertices[this.vertices.length - 1].self.properties) {
                    if (prop.key === 'deployer:context_id') {
                        this.vertices[this.vertices.length - 1].detailUrl = `deploy/context/${prop.values[0].value}`;
                    }
                }
            } else if (this.vertices[this.vertices.length - 1].self.types[0] === 'resource:bucket') {
                this.vertices[this.vertices.length - 1].detailUrl =
                    `storage/${this.vertices[this.vertices.length - 1].self.id}`;
            }
        }
    }

    findDisplayName(vertex: PersistedVertex): string {
        const nameProperties = new Set([
            'resource:bucket_name',
            'resource:file_name',
            'deployer:context_spec_image',
            'project:project_name'
        ]);

        const prop: undefined | any = vertex.properties.find(prop => nameProperties.has(prop.key));
        if (prop === undefined) {
            return `id=${vertex.id}`;
        } else {
            return `${prop.values[0].value}`;
        }
    }
}

// Constants affecting the graph display
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10.0;
const ICON_SIZE: Coordinates = {
    x: 24,
    y: 24
};
const LABEL_OFFSET: Coordinates = {
    x: 24,
    y: 24
};
// Colorscale for multiple clusters, projects, etc. Not used at the moment...
const COLOR = d3.scaleOrdinal(d3.schemeCategory10);
const COLLAPSIBLE_TYPES = ['resource:file', 'deployer:context'];


// TODO: I have used "any" in a few cases to avoid typescript compilation errors
// TODO: related to d3 functions, objects. Fix this.
function drawGraph(vertices: DisplayVertex[], edges: any[]) {

    // Select and store the div which will contain the entire graph.
    let graphDiv = d3.select('#d3-graph')

    // Get bounding box of div from html template
    let nodeElement: any = graphDiv.node();
    let height: number = nodeElement.getBoundingClientRect().height;
    let width: number = nodeElement.getBoundingClientRect().width;

    // Temporary variables used for re-centering when resizing the window.
    let w = width;
    let h = height;
    let forceCenter: Coordinates = {
        x: width / 2,
        y: height / 2
    };

    // Set up svg.
    let svg = graphDiv.append('svg');
    svg.style('cursor', 'move')
        .style('width', '100%')
        .style('height', '100%');

    // Initialize zoom behaviour, set up the initial zoom transform.
    let zoom = d3.zoom().scaleExtent([MIN_ZOOM, MAX_ZOOM]);
    let currentZoomTransform: ScreenTransform = {
        x: 0.0,
        y: 0.0,
        k: 1.0
    }

    // Append tooltip to DOM and hide it.
    let tooltip = graphDiv.append('div')
        .classed('invisible', true);

    // Initialize simulation
    let simulation: any = d3.forceSimulation()
        .force('link', d3.forceLink().id((d: DisplayEdge) => {
                return d.id;
            })
                .distance(20)
                .strength(0.5)
        )
        .force('charge', d3.forceManyBody().strength(-300).distanceMax(200))
        .force('center', d3.forceCenter(forceCenter.x, forceCenter.y));

    // Pass link and node data to the simulation, define redraw action per
    // 'tick' (simulation time step)
    simulation.nodes(vertices)
        .on('tick', ticked);
    simulation.force('link').links(edges);

    // Build an array of starting and ending links for each node containing the actual link
    // object (not just the ids). Note that the ids have been replaced with the objects by
    // d3 when initializing the force simulation.
    for (let node of vertices) {
        node.startingLinks = [];
        node.endingLinks = [];
        node.aggregated = false;
        node.mergedTo = null;
    }
    for (let link of edges) {
        link.source.startingLinks.push(link);
        link.target.endingLinks.push(link);
    }

    // Add the links
    svg.selectAll('.links')
        .data(edges)
        .enter()
        .append('g')
        .attr('class', 'links')
        .append('line')
        .on('mouseover', mouseoverLink)
        .on('mouseout', mouseout);

    // Add a svg group for each node and assign it to the node class
    svg.selectAll('.nodes')
        .data(vertices)
        .enter()
        .append('g')
        .attr('class', 'nodes');

    // Add an underlying white circle to each node
    svg.selectAll('.nodes')
        .append('circle')
        .attr('r', Math.max(ICON_SIZE.x, ICON_SIZE.y) / 2)
        .attr('cx', ICON_SIZE.x / 2)
        .attr('cy', ICON_SIZE.y / 2);

    // Add the icon path to each node
    svg.selectAll('.nodes')
        .append('path')
        .attr('d', (d: DisplayVertex) => {
            return icons[d.self.types[0]].path
        });

    // Deactivate double-click zoom and determine zoom behaviour on
    // regular zoom.
    svg.call(zoom).on('dblclick.zoom', null);
    zoom.on('zoom', () => {
        repositionLinks(d3.event.transform);
        repositionNodes(d3.event.transform);
        currentZoomTransform = d3.event.transform;
    });

    // Recenter the graph on window resize
    d3.select(window).on('resize', resize);

    updateGraph();

    function updateGraph() {

        // Add or remove interactions to/from the nodes.
        svg.selectAll('.nodes')
            .call(d3.drag()
                .on('start', (d: DisplayVertex) => {
                    return d.mergedTo === null ? dragstarted(d) : null
                })
                .on('drag', (d: DisplayVertex) => {
                    return d.mergedTo === null ? dragged(d) : null
                })
                .on('end', (d: DisplayVertex) => {
                    return d.mergedTo === null ? dragended(d) : null
                })
            )
            .on('mouseover', (d: DisplayVertex) => {
                return d.mergedTo === null ? mouseoverNode(d) : null
            })
            .on('mouseout', mouseout)
            .on('dblclick', (d: DisplayVertex) => {
                return d.mergedTo === null ? doubleClick(d) : null
            })
            .on('click', clicked);

        // Adapt visibility of the nodes
        svg.selectAll('.nodes')
            .classed('invisible', (d: DisplayVertex) => {
                return d.mergedTo !== null;
            });
    }

    // Event listeners which need access to the SVG drawing context.
    // -------------------------------------------------------------

    function ticked() {
        repositionLinks(currentZoomTransform);
        repositionNodes(currentZoomTransform);
    }

    function repositionLinks(transform: ScreenTransform) {
        svg.selectAll('.links').selectAll('line')
            .attr('x1', (d: DisplayEdge) => {
                return zoomedCoords(linkCoords(d).start, transform).x;
            })
            .attr('y1', (d: DisplayEdge) => {
                return zoomedCoords(linkCoords(d).start, transform).y;
            })
            .attr('x2', (d: DisplayEdge) => {
                return zoomedCoords(linkCoords(d).end, transform).x;
            })
            .attr('y2', (d: DisplayEdge) => {
                return zoomedCoords(linkCoords(d).end, transform).y;
            });
    }

    function repositionNodes(transform: ScreenTransform) {
        svg.selectAll('.nodes')
            .attr('transform', (d: DisplayVertex) => {
                return zoomedCoordsTransform(d, transform);
            });
    }

    function dragstarted(d: DisplayVertex) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    // Using shift in coordinates between two events is the easiest since
    // we don't have to deal with offsets.
    function dragged(d: d3.SimulationNodeDatum) {
        d.fx += d3.event.sourceEvent.movementX / currentZoomTransform.k;
        d.fy += d3.event.sourceEvent.movementY / currentZoomTransform.k;
    }

    function dragended(d: DisplayVertex) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    function mouseoverNode (d: DisplayVertex) {
        tooltip
            .classed('invisible edge-tooltip', false)
            .classed('node-tooltip', true);
        tooltip.html(vertexQTip(d.self))
            .style('left', (zoomedCoords(d, currentZoomTransform).x
                + LABEL_OFFSET.x * currentZoomTransform.k) + 'px')
            .style('top', (zoomedCoords(d, currentZoomTransform).y
                + LABEL_OFFSET.y * currentZoomTransform.k) + 'px');
        svg.style('cursor', 'pointer');
    }

    function mouseoverLink (d: any) {
        let linkCenter: Coordinates = {
            x: 0.5 * (d.x1 + d.x2),
            y: 0.5 * (d.y1 + d.y2)
        };

        tooltip
            .classed('invisible node-tooltip', false)
            .classed('edge-tooltip', true);

        tooltip.html(edgeQTip(d.self))
            .style('left', zoomedCoords(linkCenter, currentZoomTransform).x
                + LABEL_OFFSET.x * currentZoomTransform.k + 'px')
            .style('top', zoomedCoords(linkCenter, currentZoomTransform).y
                + LABEL_OFFSET.y * currentZoomTransform.k + 'px');
        svg.style('cursor', 'pointer');
    }

    function mouseout() {
        tooltip
            .classed('edge-tooltip node-tooltip', false)
            .classed('invisible', true);
        svg.style('cursor', 'move');
    }

    function doubleClick(d: DisplayVertex) {
        if (d.detailUrl !== undefined) {
            router.push(d.detailUrl);
        }
    }

    // Collapse or expand nodes on click
    function clicked(d: any) {
        if (d.mergedTo !== null || !d.collapsible) {
            return;
        }

        // Relink edges.
        let collapsing = !d.aggregated;
        d.aggregated = !d.aggregated;
        for (let link of d.endingLinks) {
            if (link.source.mergedTo === null && collapsing) {
                link.source.mergedTo = d;
            } else if (link.source.mergedTo === d && !collapsing) {
                link.source.mergedTo = null;
            }
        }
        for (let link of d.startingLinks) {
            if (link.target.mergedTo === null && collapsing) {
                link.target.mergedTo = d;
            } else if (link.target.mergedTo === d && !collapsing) {
                link.target.mergedTo = null;
            }
        }

        // Change path of clicked vertices.
        d3.select(this)
            .select('path')
            .attr('d', (d: DisplayVertex) => {
                if (d.aggregated) {
                    return icons[d.self.types[0]].aggregatedPath
                } else {
                    return icons[d.self.types[0]].path
                }
            });
        updateGraph();
    }

    function resize() {
        // Reset the dimensions of the SVG.
        height = nodeElement.getBoundingClientRect().height;
        width = nodeElement.getBoundingClientRect().width;
        svg.attr('width', width).attr('height', height);

        // Shift center for centerForce by half the change in window size
        forceCenter.x = forceCenter.x + 0.5 * (width - w ) / currentZoomTransform.k;
        forceCenter.y = forceCenter.y + 0.5 * (height - h) / currentZoomTransform.k;
        simulation.force('center', d3.forceCenter(forceCenter.x, forceCenter.y)).restart();
        w = width;
        h = height;
    }
}


// Plain functions which don't need access to the context of the SVG drawing.
// --------------------------------------------------------------------------

// Connect the links to the new nodes for merged nodes
function linkCoords(link: any): LinkCoordinates {

    let returnData: LinkCoordinates = {
        start: {
            x: null,
            y: null
        },
        end: {
            x: null,
            y: null
        }
    };

    if (link.source.mergedTo === null) {
        returnData.start.x = link.source.x;
        returnData.start.y = link.source.y;
    } else {
        returnData.start.x = link.source.mergedTo.x;
        returnData.start.y = link.source.mergedTo.y;
    }
    if (link.target.mergedTo === null) {
        returnData.end.x = link.target.x;
        returnData.end.y = link.target.y;
    } else {
        returnData.end.x = link.target.mergedTo.x;
        returnData.end.y = link.target.mergedTo.y;
    }
    return returnData;
}

function zoomedCoordsTransform(coords: Coordinates, transform: ScreenTransform) {
    return 'translate(' + (transform.x + (coords.x - 0.5 * ICON_SIZE.x) * transform.k) + ', '
        + (transform.y + (coords.y - 0.5 * ICON_SIZE.y) * transform.k) + ')'
        + 'scale(' + transform.k + ')'
}

function zoomedCoords(coords: any, transform: ScreenTransform): Coordinates {
    return {
        x: transform.x + coords.x * transform.k,
        y: transform.y + coords.y * transform.k
    };
}

function vertexQTip(vertex: PersistedVertex): string {
    const types = vertex.types.map(x => `<code>${x}</code>`);
    let propValues: Property[] = [];
    vertex.properties.forEach(prop => prop.values.forEach(vp => propValues.push(vp)));
    const rows = propValues.map(
        prop => `<tr><td>${prop.key}</td><td style="padding-left: 30px;">${prop.value}</td></tr>`
    );

    return `<table>
        <tr><td>id</td><td style="padding-left: 30px;">${vertex.id}</td></tr>
        <tr><td>types</td><td style="padding-left: 30px;">${types.join(' ')}</td></tr>
        ${rows.join('')}
    </table>
    `
}

function edgeQTip(edge: PersistedEdge): string {
    const rows = edge.properties.map(
        prop => `<tr><td>${prop.key}</td><td style="padding-left: 30px;">${prop.value}</td></tr>`
    );

    return `<table>
        <tr><td>id</td><td style="padding-left: 30px;">${edge.id}</td></tr>
        <tr><td>label</td><td style="padding-left: 30px;"><code>${edge.label}</code></td></tr>
        ${rows.join('')}
    </table>
    `
}
