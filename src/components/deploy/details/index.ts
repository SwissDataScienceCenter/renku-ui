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
import { getContext } from '../../../utils/renga-api'


@Component({
    template: require('./details.html')
})
export class DetailExecutionComponent extends Vue {

    logs: string = ''
    port: string = ''
    deploy_ip: string = 'localhost'
    context: any = null

    mounted () {
        this.updateLogs()
        this.updatePorts()
        this.loadContext()
    }

    loadContext() {
        getContext(this.$route.params.id)
            .then(data => {
                this.context = data
            })
    }

    beforeRouteUpdate (to, from, next) {
        this.updateLogs()
        this.updatePorts()
        this.loadContext()
        next()
    }

    beforeRouteEnter (to, from, next) {
        next(vm => {
            vm.updateLogs()
            vm.updatePorts()
            vm.loadContext()
            })
    }

    clickRefresh(event: Event): void {
        this.updateLogs()
    }

    clickItem(event: Event): void {
        let url = `http://${this.deploy_ip}:${this.port}`

        // For rengahub/minimal-notebook with a notebook input we adapt the path
        if (this.context.spec.image.includes('rengahub/minimal-notebook') &&
            this.context.spec.labels.find( label => label.includes('renga.context.inputs.notebook='))) {

            url += '/notebooks/current_context/inputs/notebook'
        }

        // If the deployer knows about the token, we append it as parameter to the URL.
        let notebookToken = this.context.spec.labels
            .find(label => label.includes('renga.notebook.token='))
            .replace('renga.notebook.token=', '')
        if (notebookToken) url += `?token=${notebookToken}`

        window.open(url)
    }

    clickStop(event: Event): void {
        fetch(`./api/deployer/contexts/${this.$route.params.id}/executions/${this.$route.params.eid}`,
            {
                method: 'DELETE',
                headers: {
                    'Accept' : 'text/plain'
                },
                credentials: 'include'
            }
        ).then(response => {
            return response.text()
            }
        ).then(response => {
            this.logs += '<br /> Stopped.'
        })
    }

    updateLogs(): void {
        fetch(`./api/deployer/contexts/${this.$route.params.id}/executions/${this.$route.params.eid}/logs`,
            {
                method: 'GET',
                headers: {
                    'Accept' : 'text/plain'
                },
                credentials: 'include'
            }
        ).then(response => {
            return response.text()
            }
        ).then(response => {
            this.logs = response.replace(/(?:\r\n|\r|\n)/g, '<br />')
        })
    }

    updatePorts(): void {

        fetch(`./api/deployer/contexts/${this.$route.params.id}/executions/${this.$route.params.eid}/ports`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            }
        ).then(response => {
            return response.json()
            }
        ).then(response => {
            if (response.ports.length > 0) {
                this.port = response.ports[0].exposed
                this.deploy_ip = response.ports[0].host
            }
        })
    }
}
