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

import { router } from '../../../main'
import { GraphItem } from '../../graph-item-list/graph-item'


Component.registerHooks([
  'beforeRouteEnter',
  'beforeRouteLeave',
  'beforeRouteUpdate'
])

@Component({
    template: require('./execution.html'),
    computed: {
        'contextUUID' : function () {
            return this.$route.params.id
        }
    }
})
export class ExecutionComponent extends Vue {

    progress: boolean = false
    url_list: string = ''

    headers: any[] = [
        {
            text: 'Identifier',
            align: 'left',
            sortable: false,
            value: 'id'
          },
          { text: 'Identifier', value: 'name' },
          { text: 'Engine', value: 'resource:spec_ports' },
          { text: 'Namespace', value: 'deployer:execution_namespace' }
        ]

    dialog: string = null;

    cancel() {
        this.dialog = null
    }

    success() {
        this.dialog = null
        location.reload()
    }

    created ()  {
        this.url_list = './api/deployer/contexts/' + this.$route.params.id + '/executions'
    }

    beforeRouteUpdate (to, from, next) {
        this.url_list = './api/deployer/contexts/' + to.params.id + '/executions'
        next()
    }

    beforeRouteEnter (to, from, next) {
        next(vm => vm.url_list = './api/deployer/contexts/' + to.params.id + '/executions')
    }

    parser(json: any): GraphItem[] {
        const array = <object[]> json['executions']
        return array.map(obj => {
            let g = new GraphItem(undefined, undefined, undefined)
            g.id = obj['identifier']
            g.name = obj['identifier']
            g.properties.push({'key': 'engine', 'value': obj['engine']})
            g.properties.push({'key': 'namespace', 'value': obj['namespace']})
            return g
        })
    }

    onSelect(eid) {
        router.push(`/deploy/context/${this.$route.params.id}/execution/${eid}`)
        // or link to the open port ? (needs the ip !)
    }
}