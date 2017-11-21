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
import { Component, Watch } from 'vue-property-decorator'

import * as d3 from 'd3'

import { loadVertices, loadEdges } from './load-graph'
import { PersistedVertex, DisplayVertex, PersistedEdge, DisplayEdge,
    ScreenTransform, Coordinates, LinkCoordinates } from './elements'
import { icons } from './icons'
import { EXECUTION, CONTEXT, BUCKET, FILE, FILE_LOCATION, FILE_VERSION, PROJECT } from './vertex-types'
import { VertexTooltipComponent, EdgeTooltipComponent } from './tooltip'
import { BaseType } from 'd3-selection'
import { GraphItem } from '../graph-item-list/graph-item'

require('./graph.styl')


// Constants affecting the graph display
const MIN_ZOOM = 0.1
const MAX_ZOOM = 10.0
const ICON_SIZE: Coordinates = {
    x: 24,
    y: 24
}
const LABEL_OFFSET: Coordinates = {
    x: 24,
    y: 24
}
// Colorscale for multiple clusters, projects, etc. Not used at the moment...
const COLOR = d3.scaleOrdinal(d3.schemeCategory10)
const COLLAPSIBLE_TYPES = [FILE, CONTEXT, PROJECT]
const COLLAPSIBLE_NEIGHBORS = {}
COLLAPSIBLE_NEIGHBORS[FILE] = [FILE_VERSION, FILE_LOCATION]
COLLAPSIBLE_NEIGHBORS[PROJECT] = [BUCKET]
COLLAPSIBLE_NEIGHBORS[CONTEXT] = [EXECUTION]

const START_COLLAPSED = true


// We register these components locally since they are only used here.
Vue.component('vertex-tooltip', VertexTooltipComponent)
Vue.component('edge-tooltip', EdgeTooltipComponent)

@Component({
    template: require('./graph.html'),
})

export class GraphComponent extends Vue {

    vertices: DisplayVertex[]
    vertexIds: string[]
    edges: DisplayEdge[]
    edgeIds: string[]

    allCollapsed: boolean = START_COLLAPSED

    selectedVertex: DisplayVertex = null
    selectedGraphItem: GraphItem
    activeVertex: DisplayVertex = null
    activeEdge: DisplayEdge = null

    dialog: string = null
    dispatcher = d3.dispatch('collapse')

    get tooltipVertex () {
        return (this.selectedVertex ? this.selectedVertex : this.activeVertex)
    }

    // TODO: Different parts of the UI currently need a differnt representation of
    // TODO: their data. Fix this
    @Watch('selectedVertex')
    updateGraphItem(newSelect) {
        if (newSelect === null) return

        if (newSelect.self.types[0] === FILE) {
            this.selectedGraphItem = new GraphItem(JSON.parse(JSON.stringify(newSelect.self)),
                'resource:file_name', 'annotation:label', '')
        } else {
            this.selectedGraphItem = null
        }
    }

    cancel() {
        this.dialog = null
    }

    toggle() {
        this.allCollapsed = !this.allCollapsed
        this.dispatcher.call('collapse')
    }

    success() {
        this.dialog = null
        this.activeVertex = null
        this.selectedVertex = null
        this.updateGraphInfo()
    }

    showDialog(i: number) {
        this.dialog = this.selectedVertex.dialogs[i].dialogType
    }

    mounted() {
        this.updateGraphInfo()
    }

    updateGraphInfo() {
        this.vertices = []
        this.vertexIds = []
        this.edges = []
        this.edgeIds = []
        // Use nested callbacks for the time being just to be sure all data has been loaded.
        loadVertices('./api/navigation/vertex', this.addVertex, () => {
            loadEdges('./api/navigation/edge', this.addEdge, () => {
                this.drawGraph(this.vertices, this.edges)
            })
        })
    }

    addEdge(edge: PersistedEdge) {

        if (this.edgeIds.indexOf(`#e${edge.id}`) !== -1) return

        this.edges.push(
            {
                id: `n${edge.id}`,
                label: `${edge.label}`,
                source: `v${edge.from}`,
                target: `v${edge.to}`,
                display_name: `${edge.label.replace(/([^:]*):(.*)/, '$2')}`,
                self: edge
            }
        )
        this.edgeIds.push(`v${edge.id}`)

        // Use this temporarily to enrich executions with the context that has produced them in order to construct
        // the correct url for this execution (contextUUID should be part of the API response)

        let newEdge = this.edges[this.edges.length - 1]

        if (newEdge.display_name === 'launch') {
            let context = this.vertices.find( vertex => vertex.id === newEdge.source)
            let execution = this.vertices.find( vertex => vertex.id === newEdge.target)
            execution.detailUrl = `deploy/context/${context.self.UUID}/execution/${execution.self.UUID}`
        }
    }

    addVertex(vertex: PersistedVertex) {

        if (this.vertexIds.indexOf(`#v${vertex.id}`) !== -1) return

        this.vertices.push({
            id: `v${vertex.id}`,
            label: `${vertex.id}`,
            display_name: this.findDisplayName(vertex),
            detailUrl: null,
            self: vertex,
            collapsible: COLLAPSIBLE_TYPES.indexOf(vertex.types[0]) >= 0,
            dialogs: this.addDialogs(vertex)
        })
        this.vertexIds.push(`v${vertex.id}`)

        let newVertex = this.vertices[this.vertices.length - 1]

        switch (newVertex.self.types[0]) {
            case CONTEXT:
                newVertex.self.UUID = newVertex.self.properties.find( prop => {
                    return prop.key === 'deployer:context_id'
                }).values[0].value
                newVertex.detailUrl = `deploy/context/${newVertex.self.UUID}`
                break

            case BUCKET:
                newVertex.detailUrl = `storage/${newVertex.self.id}`
                break

            case EXECUTION:
                newVertex.self.UUID = newVertex.self.properties.find( prop => {
                    return prop.key === 'deployer:execution_id'
                }).values[0].value
                // detailUrl is added once we know about the edges
                break
        }
    }

    addDialogs(vertex: PersistedVertex) {
        let dialogs = []
        if (vertex.types[0] === PROJECT) {
            dialogs.push({
                name: 'Add bucket',
                dialogType: 'project'
            })
            dialogs.push({
                name: 'Add execution context',
                dialogType: 'context'
            })
        }
        if (vertex.types[0] === CONTEXT) {
            dialogs.push({
                name: 'Launch execution',
                dialogType: 'execution'
            })
        }
        if (vertex.types[0] === BUCKET) {
            dialogs.push({
                name: 'Add file',
                dialogType: 'bucket'
            })
        }
        if (vertex.types[0] === FILE) {
            dialogs.push({
                name: 'Add version',
                dialogType: 'version'
            })
            dialogs.push({
                name: 'Rename',
                dialogType: 'rename'
            })
            dialogs.push({
                name: 'Labels',
                dialogType: 'labels'
            })
        }
        return dialogs
    }

    findDisplayName(vertex: PersistedVertex): string {
        const nameProperties = new Set([
            'resource:bucket_name',
            'resource:file_name',
            'deployer:context_spec_image',
            'project:project_name'
        ])

        const prop: undefined | any = vertex.properties.find(prop => nameProperties.has(prop.key))
        if (prop === undefined) {
            return `id=${vertex.id}`
        } else {
            return `${prop.values[0].value}`
        }
    }

    
// TODO: I have used "any" in a few cases to avoid typescript compilation errors
// TODO: related to d3 functions, objects. Fix this.
    drawGraph(vertices: DisplayVertex[], edges: any[]) {

        // Small workaround to use this of the enclosing function.
        let graphComponent = this

        // Select and store the div which will contain the entire graph.
        let graphDiv = d3.select('#d3-graph')

        // Remove a potentially existing SVG drawing.
        d3.select('#graphSVG').remove()

        // Get bounding box of div from html template
        let nodeElement: any = graphDiv.node()
        let height: number = nodeElement.getBoundingClientRect().height
        let width: number = nodeElement.getBoundingClientRect().width

        // Temporary variables used for re-centering when resizing the window.
        let w = width
        let h = height
        let forceCenter: Coordinates = {
            x: width / 2,
            y: height / 2
        }

        // Set up svg.
        let svg = graphDiv.append('svg')
        svg.style('cursor', 'move')
            .style('width', '100%')
            .style('height', '100%')
            .attr('id', 'graphSVG')

        // Define a reusable arrowhead marker
        svg.append('marker')
            .attr('id', 'arrowhead')
            .attr('class', 'links')
            .attr('viewBox', '-4 -2 4 4')
            .attr('refX', 4)
            .attr('markerWidth', 4)
            .attr('markerHeight', 4)
            .attr('orient', 'auto')
            .append('polygon')
            .attr('points', '-4,-2 0,0 -4,2')

        // Initialize zoom behaviour, set up the initial zoom transform.
        let zoom = d3.zoom().scaleExtent([MIN_ZOOM, MAX_ZOOM])
        let currentZoomTransform: ScreenTransform = {
            x: 0.0,
            y: 0.0,
            k: 1.0
        }

        // Initialize simulation
        let simulation: any = d3.forceSimulation()
            .force('link', d3.forceLink().id((d: DisplayEdge) => {
                    return d.id
                })
                    .distance(20)
                    .strength(0.5)
            )
            .force('charge', d3.forceManyBody().strength(-300).distanceMax(200))
            .force('center', d3.forceCenter(forceCenter.x, forceCenter.y))

        // Pass link and node data to the simulation, define redraw action per
        // 'tick' (simulation time step)
        simulation.nodes(vertices)
            .on('tick', ticked)
        simulation.force('link').links(edges)

        // Build an array of starting and ending links for each node containing the actual link
        // object (not just the ids). Note that the ids have been replaced with the objects by
        // d3 when initializing the force simulation.
        for (let node of vertices) {
            node.startingLinks = []
            node.endingLinks = []
            node.aggregated = false
            node.mergedTo = null
        }
        for (let link of edges) {
            link.source.startingLinks.push(link)
            link.target.endingLinks.push(link)
        }

        // Add the links
        svg.selectAll('.links')
            .data(edges)
            .enter()
            .append('g')
            .attr('id', d => d.id)
            .attr('class', 'links')
            .append('line')
            .on('mouseover', mouseoverLink)
            .on('mouseout', mouseout)

        // Add a svg group for each node and assign it to the node class
        svg.selectAll('.nodes')
            .data(vertices)
            .enter()
            .append('g')
            .attr('class', 'nodes')

        // Add an underlying white circle to each node
        svg.selectAll('.nodes')
            .append('circle')
            .attr('r', Math.max(ICON_SIZE.x, ICON_SIZE.y) / 2)
            .attr('cx', ICON_SIZE.x / 2)
            .attr('cy', ICON_SIZE.y / 2)

        // Add the icon path to each node
        svg.selectAll('.nodes')
            .append('path')
            .attr('d', (d: DisplayVertex) => {
                return icons[d.self.types[0]].path
            })

        // Deactivate double-click zoom and determine zoom behaviour on
        // regular zoom.
        svg.call(zoom).on('dblclick.zoom', null)
        zoom.on('zoom', () => {
            repositionLinks(d3.event.transform)
            repositionNodes(d3.event.transform)
            currentZoomTransform = d3.event.transform
            d3.select('#arrowhead')
                .attr('refX', 4 * currentZoomTransform.k)
        })

        // Recenter the graph on window resize
        d3.select(window).on('resize', resize)

        updateGraph()

        aggregateAll()

        graphComponent.dispatcher.on('collapse', aggregateAll)

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
                .on('click', (d: DisplayVertex) => {
                    return d.mergedTo === null ? clicked(d) : null
                })
                .on('dblclick', (d, i, group) => {
                    graphComponent.activeVertex = null
                    graphComponent.selectedVertex = null
                    aggregate(d, i, group, true)
                })

            svg.selectAll('.links')

            // Adapt visibility of the nodes
            svg.selectAll('.nodes')
                .classed('invisible', (d: DisplayVertex) => {
                    return d.mergedTo !== null
                })
        }

        // Event listeners which need access to the SVG drawing context.
        // -------------------------------------------------------------

        function ticked() {
            repositionLinks(currentZoomTransform)
            repositionNodes(currentZoomTransform)
        }

        function repositionLinks(transform: ScreenTransform) {
            svg.selectAll('.links').selectAll('line')
                .attr('x1', (d: DisplayEdge) => {
                    return zoomedCoords(linkCoords(d).start, transform).x
                })
                .attr('y1', (d: DisplayEdge) => {
                    return zoomedCoords(linkCoords(d).start, transform).y
                })
                .attr('x2', (d: DisplayEdge) => {
                    return zoomedCoords(linkCoords(d).end, transform).x
                })
                .attr('y2', (d: DisplayEdge) => {
                    return zoomedCoords(linkCoords(d).end, transform).y
                })
        }

        function repositionNodes(transform: ScreenTransform) {
            svg.selectAll('.nodes')
                .attr('transform', (d: DisplayVertex) => {
                    return zoomedCoordsTransform(d, transform)
                })
        }

        function dragstarted(d: DisplayVertex) {
            graphComponent.activeVertex = null
            if (!d3.event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
        }

        // Using shift in coordinates between two events is the easiest since
        // we don't have to deal with offsets.
        function dragged(d: d3.SimulationNodeDatum) {
            graphComponent.activeVertex = null
            d.fx += d3.event.sourceEvent.movementX / currentZoomTransform.k
            d.fy += d3.event.sourceEvent.movementY / currentZoomTransform.k
        }

        function dragended(d: DisplayVertex) {
            graphComponent.activeVertex = d
            if (!d3.event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
        }

        function mouseoverNode (d: DisplayVertex) {
            if (graphComponent.selectedVertex === null) {
                d3.select('#nodeTooltip')
                    .style('left', (zoomedCoords(d, currentZoomTransform).x
                        + LABEL_OFFSET.x * currentZoomTransform.k) + 'px')
                    .style('top', (zoomedCoords(d, currentZoomTransform).y
                        + LABEL_OFFSET.y * currentZoomTransform.k) + 'px')
                svg.style('cursor', 'pointer')
                graphComponent.activeVertex = d
            }
        }

        function mouseoverLink(d) {
            let linkCenter: Coordinates = {
                x: 0.5 * (linkCoords(d).start.x + linkCoords(d).end.x),
                y: 0.5 * (linkCoords(d).start.y + linkCoords(d).end.y)
            }
            d3.select('#edgeTooltip')
                .style('left', (zoomedCoords(linkCenter, currentZoomTransform).x
                    + LABEL_OFFSET.x * currentZoomTransform.k) + 'px')
                .style('top', (zoomedCoords(linkCenter, currentZoomTransform).y
                    + LABEL_OFFSET.y * currentZoomTransform.k) + 'px')
            svg.style('cursor', 'pointer')
            graphComponent.activeEdge = d
        }

        function mouseout() {
            svg.style('cursor', 'move')
            graphComponent.activeVertex = null
            graphComponent.activeEdge = null
        }

        function clicked(d: DisplayVertex) {
            if (graphComponent.selectedVertex === d) {
                graphComponent.selectedVertex = null
            } else if (graphComponent.selectedVertex === null) {
                graphComponent.selectedVertex = d
            }
        }

        // Collapse or expand nodes on click
        function aggregate(d: any, i: number, group: ArrayLike<BaseType>, update: boolean) {
            if (d.mergedTo !== null || !d.collapsible) {
                return
            }

            let vertexType = d.self.types[0]
            let oktypes = COLLAPSIBLE_NEIGHBORS[vertexType]

            // Relink edges.
            let collapsing = !d.aggregated
            d.aggregated = !d.aggregated
            for (let link of d.endingLinks) {
                if (link.source.mergedTo === null && collapsing && oktypes.indexOf(link.source.self.types[0]) >= 0) {
                    link.source.mergedTo = d
                } else if (link.source.mergedTo === d && !collapsing) {
                    link.source.mergedTo = null
                }
            }
            for (let link of d.startingLinks) {
                if (link.target.mergedTo === null && collapsing && oktypes.indexOf(link.target.self.types[0]) >= 0) {
                    link.target.mergedTo = d
                } else if (link.target.mergedTo === d && !collapsing) {
                    link.target.mergedTo = null
                }
            }

            // Check for other zero-length links and make them (or their heads) invisible
            for (let link of edges) {
                let linkC = linkCoords(link)
                let invisible = linkC.start.x === linkC.end.x && linkC.start.y === linkC.end.y
                d3.select(`#${link.id}`).classed('invisible', invisible)
            }

            // Change path of clicked vertices
            d3.select(group[i])
                .select('path')
                .attr('d', (d: DisplayVertex) => {
                    if (d.aggregated) {
                        return icons[vertexType].aggregatedPath
                    } else {
                        return icons[vertexType].path
                    }
                })
            if (update) updateGraph()
        }

        function aggregateAll() {
            d3.selectAll('.nodes')
                .each((d: any, i, group) => {
                    if (d.aggregated !== graphComponent.allCollapsed) {
                        aggregate(d, i, group, false)
                    }
                })
            updateGraph()
            // Run one tick to make sure the lines are redrawn.
            ticked()
        }

        function resize() {
            // Reset the dimensions of the SVG.
            height = nodeElement.getBoundingClientRect().height
            width = nodeElement.getBoundingClientRect().width
            svg.attr('width', width).attr('height', height)

            // Shift center for centerForce by half the change in window size
            forceCenter.x = forceCenter.x + 0.5 * (width - w ) / currentZoomTransform.k
            forceCenter.y = forceCenter.y + 0.5 * (height - h) / currentZoomTransform.k
            simulation.force('center', d3.forceCenter(forceCenter.x, forceCenter.y)).restart()
            w = width
            h = height
        }
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
    }

    if (link.source.mergedTo === null) {
        returnData.start.x = link.source.x
        returnData.start.y = link.source.y
    } else {
        returnData.start.x = link.source.mergedTo.x
        returnData.start.y = link.source.mergedTo.y
    }
    if (link.target.mergedTo === null) {
        returnData.end.x = link.target.x
        returnData.end.y = link.target.y
    } else {
        returnData.end.x = link.target.mergedTo.x
        returnData.end.y = link.target.mergedTo.y
    }
    return returnData
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
    }
}

export function findDisplayName(vertex: PersistedVertex): string {
    const nameProperties = new Set([
        'resource:bucket_name',
        'resource:file_name',
        'deployer:context_spec_image',
        'project:project_name'
    ])

    const prop: undefined | any = vertex.properties.find(prop => nameProperties.has(prop.key))
    if (prop === undefined) {
        return `id=${vertex.id}`
    } else {
        return `${prop.values[0].value}`
    }
}
