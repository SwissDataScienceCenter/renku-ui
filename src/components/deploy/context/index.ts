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
import { Watch } from 'vue-property-decorator'
import { router } from '../../../main'

import { GraphItem } from '../../graph-item-list/graph-item'
import { getProjectResources } from '../../../utils/renga-api'


@Component({
    template: require('./context.html'),
    props: {
        project: Object
    }
})
export class ContextComponent extends Vue {

    update = false
    progress: boolean = false
    dialog: string = null
    project: object
    contextUUIDs: string[] = []

    cancel() {
        this.dialog = null
    }

    success() {
        this.dialog = null
        this.updateContexts()
        this.$parent['KGupdated'] = true
    }

    activated() {
        this.updateContexts()
    }

    updateContexts() {
        if (this.project) {
            this.onProjectChange()
        } else {
            this.update = true
        }
    }

    // This is a temporary solution  for displaying only contexts for the selected project.
    @Watch('project')
    onProjectChange() {
        getProjectResources(this.project['id'])
            .then( (resources: any[]) => {
                this.contextUUIDs = resources
                    .filter( resource => resource['types'][0] === 'deployer:context')
                    .map( resource => {
                            let property = resource.properties.find(prop => prop['key'] === 'deployer:context_id')
                            return property.values[0]['value']
                        }
                    )
                this.update = true
            })
    }

    headers: any[] = [
        {
            text: 'Identifier',
            align: 'left',
            sortable: false,
            value: 'id'
          },
          { text: 'Image', value: 'name' },
          { text: 'Labels', value: 'labels', sortable: false},
          { text: 'Ports', value: 'ports', align: 'right' }
        ]

    parser(json: any): GraphItem[] {
        const array = <any[]> json['contexts']
        return array
            .map(obj => {
                let g = new GraphItem(undefined, undefined, undefined, undefined)
                g.id = obj['identifier']
                g.name = obj['spec']['image']

                let labelString = obj['spec']['labels']
                    .filter( label => label.includes('renga.meta_data.label='))
                    .map( label => label.replace('renga.meta_data.label=', ''))
                    .join(', ')
                g.labels = labelString
                g.properties.push({'key': 'labels', 'value': labelString})

                if (!(obj['spec']['ports'] === undefined)) {
                    g.properties.push({'key': 'ports', 'value': obj['spec']['ports'].join(', ')})
                } else {
                    g.properties.push({'key': 'ports', 'value': '-'})
                }
                return g
            })
            .filter( (g: any) => {
                if (this.project) {
                    return this.contextUUIDs.indexOf(g.id) >= 0
                } else {
                    return true
                }
            })


    }

    onSelect(context) {
        router.push(`/deploy/context/${context.id}`)
    }
}
