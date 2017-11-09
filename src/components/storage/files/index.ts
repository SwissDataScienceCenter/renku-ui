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

import { GraphItem } from '../../graph-item-list/graph-item'


Component.registerHooks([
  'beforeRouteEnter',
  'beforeRouteLeave',
  'beforeRouteUpdate'
])

@Component({
    template: require('./files.html'),
    computed: {
        'bucketId': function () {
            return parseInt(this.$route.params.id)
        }
    }
})
export class FilesComponent extends Vue {

    selectedFileId: number = null
    progress: boolean = false
    detailsPanel: boolean = false
    url_list: string = ''
    file_versions = []
    dialog: string = null

    parser: any = json => {
                console.log('list', json)
                const array = <object[]> json
                return array.map(obj => {
                    return new GraphItem(obj, 'resource:file_name', '')
                })
            }

    headers: any[] = [
        {
            text: 'Identifier',
            align: 'left',
            sortable: false,
            value: 'id'
          },
          { text: 'Name', value: 'name' },
          { text: 'resource:owner', value: 'resource:owner' }
        ]

    cancel() {
        this.dialog = null
    }

    success() {
        this.dialog = null
        location.reload()
    }

    created ()  {
        this.url_list = `./api/explorer/storage/bucket/${this.$route.params.id}/files`
    }

    beforeRouteUpdate (to, from, next) {
        this.url_list = `./api/explorer/storage/bucket/${to.params.id}/files`
        next()
    }

    beforeRouteEnter (to, from, next) {
        next(vm => vm.url_list = `./api/explorer/storage/bucket/${to.params.id}/files`)
    }

    onSelect(oid) {
        this.selectedFileId = oid

        fetch(`./api/explorer/storage/file/${oid}/versions`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
            }
        ).then(response => {
            return response.json()
            }
        ).then(response => {
            this.file_versions = response
            this.file_versions.sort(function(a, b) { return a.properties[1].values[0].value - b.properties[1].values[0].value })
            this.detailsPanel = true
        })
    }
}
