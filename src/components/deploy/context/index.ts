import Vue from 'vue'
import Component from 'vue-class-component'
import _ from 'lodash'
import { router } from '../../../main'

import { GraphItem } from '../../graph-item-list/graph-item'

@Component({
    template: require('./context.html')
})
export class ContextComponent extends Vue {

    progress: boolean = false
    contextDialog: boolean = false
    context_image: string = ''
    context_ports: string = ''

    headers: any[] = [
        {
            text: 'Identifier',
            align: 'left',
            sortable: false,
            value: 'id'
          },
          { text: 'Image', value: 'name' },
          { text: 'Ports', value: 'ports', align: 'right' }
        ]

    parser(json:any): GraphItem[] {
        const array = <any[]> json['contexts']
        return array.map(obj => {
            let g = new GraphItem(undefined, undefined, undefined)
            g.id = obj['identifier']
            g.name = obj['spec']['image']
            if (!(obj['spec']['ports']===undefined)) {
                g.properties.push({'key': 'ports', 'value': obj['spec']['ports'].join(", ")})
            } else {
                g.properties.push({'key': 'ports', 'value': "-"})
            }
            return g
        })
    }

    addContext(event: Event): void {
        this.progress = true
        this.contextDialog = false
        let payload = JSON.stringify({
          image: this.context_image,
          ports: this.context_ports.split(/\s*,\s*/)
        })

        fetch('./api/deployer/contexts',
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
            this.progress = false
            location.reload()
        })
    }

    onSelect(id) {
        router.push("/deploy/context/" + id)
    }
}