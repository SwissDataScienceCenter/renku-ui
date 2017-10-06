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
import download from 'downloadjs'

import { GraphItem } from '../../graph-item-list/graph-item'

Component.registerHooks([
  'beforeRouteEnter',
  'beforeRouteLeave',
  'beforeRouteUpdate'
])

@Component({
    template: require('./files.html')
})
export class FilesComponent extends Vue {

    progress: boolean = false
    bucketDialog: boolean = false
    versionDialog: boolean = false
    detailsPanel: boolean = false
    bucketfile: string = ''
    filename: string = ''
    selected_file: string = ''

    url_list: string = ''

    file_versions = []

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

    created ()  {
        this.url_list = './api/explorer/storage/bucket/' + this.$route.params.id + '/files'
    }

    beforeRouteUpdate (to, from, next) {
        this.url_list = './api/explorer/storage/bucket/' + to.params.id + '/files'
        next()
    }

    beforeRouteEnter (to, from, next) {
        next(vm => vm.url_list = './api/explorer/storage/bucket/' + to.params.id + '/files')
    }

    addFile(event: Event): void {
        this.progress = true
        this.bucketDialog = false
        let payload = JSON.stringify({
          file_name: this.bucketfile,
          bucket_id: parseInt(this.$route.params.id),
          request_type: 'create_file'
        })

        this.executeUpload(fetch('./api/storage/authorize/create_file',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: payload
            }
        ))
    }

    addFileVersion(event: Event): void {
        this.progress = true
        this.versionDialog = false
        let payload = JSON.stringify({
          resource_id: this.selected_file,
          request_type: 'write_file'
        })

        this.executeUpload(fetch('./api/storage/authorize/write',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: payload
            }
        ))
    }

    executeUpload(fetchData): void {

        fetchData.then(response => {
            return response.json()
            }
        ).then(response => {
            console.log('create', response)
            let e = this.$refs.fileInput as HTMLInputElement
            const reader = new FileReader()
            reader.onload = aFile => {
                fetch('./api/storage/io/write',
                    {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Authorization': 'Bearer ' + response.access_token
                        },
                        body: reader.result
                    }
                ).then(r => {
                    this.progress = false
                    location.reload()
                })
            }
            reader.readAsArrayBuffer(e.files[0])
        })

    }

    onFocus() {
        let e = this.$refs.fileInput as HTMLElement
        e.click()
    }

    onFileChange($event) {
        const files = $event.target.files || $event.dataTransfer.files;
        if (files) {
            if (files.length > 0) {
                this.filename = _.map(files, 'name').join(', ');
            } else {
                this.filename = null;
            }
        } else {
            this.filename = $event.target.value.split('\\').pop();
        }
        this.$emit('input', this.filename);
    }

    onSelect(oid) {

        this.selected_file = oid

        let that = this

        fetch('./api/explorer/storage/file/' + oid + '/versions',
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
            this.file_versions.sort(function(a, b){ return a.properties[1].values[0].value - b.properties[1].values[0].value })
            this.detailsPanel = true
        })

    }

}