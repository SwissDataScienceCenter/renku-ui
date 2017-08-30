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

@Component({
    template: require('./files.html')
})
export class FilesComponent extends Vue {

    progress: boolean = false
    bucketDialog: boolean = false
    bucketfile: string = ''
    filename: string = ''

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
          { text: 'resource:file_name', value: 'resource:file_name' },
          { text: 'resource:owner', value: 'resource:owner' }
        ]

    addFile(event: Event): void {
        this.progress = true
        this.bucketDialog = false
        let payload = JSON.stringify({
          file_name: this.bucketfile,
          bucket_id: parseInt(this.$route.params.id),
          request_type: 'create_file'
        })

        fetch('./api/storage/authorize/create_file',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: payload
            }
        ).then(response => {
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

    onSelect(id) {

        window.location.href = './download?id=' + id
       /* this.progress = true
        let that = this
        let payload = JSON.stringify({
          resource_id: id,
          request_type: 'read_file'
        })

        fetch('/api/storage/authorize/read',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: payload
            }
        ).then(response => {
            return response.json()
            }
        ).then(response => {
            console.log('create', response)
            fetch('/api/storage/io/read',
                {
                    credentials: 'include',
                    headers: {
                        'Authorization': 'Bearer ' + response.access_token
                    }
                }
            ).then(r => {
                console.log(r)

                return r.blob()
            }).then(function(blob) {
                that.progress = false
                download(blob)
                })
        })*/

    }

}