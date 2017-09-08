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
import _ from 'lodash'
import { router } from '../../main'

import cytoscape from 'cytoscape'
import cyqtip from 'cytoscape-qtip'
import { loadVertices, loadEdges } from './load-graph'
import { PersistedVertex, PersistedEdge, Property } from './elements'


cyqtip( cytoscape );


function vertexQTip(vertex: PersistedVertex): String {
    const types = vertex.types.map(x => `<code>${x}</code>`)
    let propValues: Property[] = []
    vertex.properties.forEach(prop => prop.values.forEach(vp => propValues.push(vp)))
    const rows = propValues.map(prop => `<tr><td>${prop.key}</td><td style="padding-left: 30px;">${prop.value}</td></tr>`)

    return `<table>
        <tr><td>id</td><td style="padding-left: 30px;">${vertex.id}</td></tr>
        <tr><td>types</td><td style="padding-left: 30px;">${types.join(' ')}</td></tr>
        ${rows.join('')}
    </table>
    `
}

function edgeQTip(edge: PersistedEdge): String {
    const rows = edge.properties.map(prop => `<tr><td>${prop.key}</td><td style="padding-left: 30px;">${prop.value}</td></tr>`)

    return `<table>
        <tr><td>id</td><td style="padding-left: 30px;">${edge.id}</td></tr>
        <tr><td>label</td><td style="padding-left: 30px;">${edge.label}</td></tr>
        ${rows.join('')}
    </table>
    `
}



@Component({
    template: require('./graph.html')
})
export class GraphComponent extends Vue {

    cy: any = null

    mounted () {
        this.cy = cytoscape({
          container: document.getElementById('cy'),
              boxSelectionEnabled: false,
            autounselectify: true,

            style: [
                {
                    'selector': 'node',
                    'style': {
                        'label': 'data(display_name)',
                        'background-color': '#252b5f',
                        'text-valign': 'center',
                        'color': 'white',
                        'text-outline-width': 2,
                        'text-outline-color': '#252b5f'
                    }
                },
                {
                    'selector': 'edge',
                    'style': {
                        'label': 'data(display_name)',
                        'curve-style': 'bezier',
                        'target-arrow-shape': 'triangle',
                        'line-color': '#252b5f',
                        'target-arrow-color': '#252b5f',
                        'text-valign': 'center',
                        'color': 'white',
                        'text-outline-width': 2,
                        'text-outline-color': '#252b5f'
                    }
                },
            ]
        })
       this.updateGraphInfo()
    }

    updateGraphInfo(): void {
        loadVertices('./api/navigation/vertex', this.addVertex, () => {
    console.log('end v')

    this.cy.makeLayout({ name: 'cose' }).run()

    loadEdges('./api/navigation/edge', this.addEdge, () => {
        console.log('end e')
        this.cy.makeLayout({ name: 'cose' }).run()
    })
})
    }

    addEdge(edge: PersistedEdge): void {
    const isNew = this.cy.edges(`#e${edge.id}`).length === 0

    if (isNew) {
        const element = this.cy.add({
            group: 'edges',
            data: {
                id: `n${edge.id}`,
                label: `${edge.label}`,
                source: `v${edge.from}`,
                target: `v${edge.to}`,
                display_name: `${edge.label.replace(/([^:]*):(.*)/, '$2')}`,
                self: edge
            }
        })

        element.qtip({
            content: edgeQTip(edge),
            position: {
                my: 'top center',
                at: 'bottom center'
            },
            style: {
                classes: 'qtip-bootstrap',
                tip: {
                    width: 24,
                    height: 8
                }
            }
        })
    }
}

    addVertex(vertex: PersistedVertex): void {
    const isNew = this.cy.nodes(`#v${vertex.id}`).length === 0

    if (isNew) {
        const element = this.cy.add({
            group: 'nodes',
            data: {
                id: `v${vertex.id}`,
                label: `${vertex.id}`,
                display_name: this.findDisplayName(vertex),
                self: vertex
            }
        })

        element.qtip({
            content: vertexQTip(vertex),
            position: {
                my: 'top center',
                at: 'bottom center'
            },
            style: {
                classes: 'qtip-bootstrap',
                tip: {
                    width: 24,
                    height: 8
                }
            }
        })
    }
}

    findDisplayName(vertex: PersistedVertex): string {
        const nameProperties = new Set([
            'resource:bucket_name',
            'resource:file_name',
            'deployer:context_spec_image',
            'project:project_name'
        ])

        const prop: undefined | any = vertex.properties.find(prop => nameProperties.has(prop.key))
        if (prop === undefined)
            return `id=${vertex.id}`
        else
            return `${prop.values[0].value}`
    }

}
