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

@Component({
    template: require('./buckets.html')
})
export class BucketsComponent extends Vue {

    progress: boolean = false
    bucketDialog: boolean = false
    bucketName: string = 'bucket'
    bucketBackend: string = 'local'

    parser: any = json => {
                console.log('list', json)
                const array = <object[]> json
                return array.map(obj => {
                    return new GraphItem(obj, "resource:bucket_name", "resource:bucket_backend")
                })
            }

    addBucket(event: Event): void {
        this.progress = true
        this.bucketDialog = false
        let payload = JSON.stringify({
          name: this.bucketName,
          backend: this.bucketBackend,
          request_type: 'create_bucket'
        })

        fetch('./api/storage/authorize/create_bucket',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: payload
            }
        ).then(response => {
                console.log('create', response)
                /* fetchItemList().then(res => {
                    if (res !== null) {
                        this.item_list.list = res
                    }*/
                    this.progress = false
                    location.reload()
                // })
        })
    }

}