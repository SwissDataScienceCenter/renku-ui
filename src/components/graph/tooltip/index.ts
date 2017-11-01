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
import { DisplayVertex, DisplayEdge } from '../elements'

// require('./tooltip.styl');

@Component({
    template: require('./vertex-tooltip.html'),
    props: {
        selectedVertex: {
            type: Object
        },
        id: {
            type: String
        },
        case: {
            type: String
        }
    }
})

export class VertexTooltipComponent extends Vue {
    selectedVertex: DisplayVertex;

    closeTooltip() {
        this.$emit('closeTooltip')
    }

    goDetail() {
        router.push(this.selectedVertex.detailUrl);
    }

    showDialog(i: number) {
        this.$emit('showDialog', `${i}`)
    }
}


@Component({
    template: require('./edge-tooltip.html'),
    props: {
        selectedEdge: {
            type: Object
        },
        id: {
            type: String
        }
    }
})

export class EdgeTooltipComponent extends Vue {
    selectedEdge: DisplayEdge;
}