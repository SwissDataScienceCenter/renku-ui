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

import { GraphItem } from '../../graph-item-list/graph-item'
import { getProjectResources} from '../../../utils/renga-api'

@Component({
    template: require('./buckets.html'),
    props: {
        project: Object
    }
})
export class BucketsComponent extends Vue {

    dialog = null
    update = false
    project: object
    bucketIds: number[] = []

    cancel() {
        this.dialog = null
    }

    success() {
        this.dialog = null
        this.$parent['KGupdated'] = true
        this.updateBuckets()
    }

    activated() {
        this.updateBuckets()
    }

    updateBuckets() {
        if (this.project) {
            this.onProjectChange()
        } else {
            this.update = true
        }
    }

    // This is a  temporary solution  for displaying only buckets for the selected project.
    @Watch('project')
    onProjectChange() {
        getProjectResources(this.project['id'])
            .then( (resources: any[]) => {
                this.bucketIds = resources
                    .filter( resource => resource['types'][0] === 'resource:bucket')
                    .map( resource => resource.id )
                this.update = true
            })
    }

    parser(json: any): GraphItem[] {
                console.log('list', json)
                const array = <object[]> json
                return array
                    .map(obj => {
                        return new GraphItem(obj, 'resource:bucket_name', '', 'resource:bucket_backend')
                    })
                    .filter( (graphItem: any) => {
                        if (this.project) {
                            return this.bucketIds.indexOf(graphItem.id) >= 0
                        } else {
                            return true
                        }
                    })
            }

}
