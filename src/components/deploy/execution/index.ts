import Vue from 'vue'
import Component from 'vue-class-component'
import _ from 'lodash'
import { router } from '../../../main'

import { GraphItem } from '../../graph-item-list/graph-item'

@Component({
    template: require('./execution.html')
})
export class ExecutionComponent extends Vue {

    progress: boolean = false
    execDialog: boolean = false
    exec_engine: string = ''
    exec_namespace: string = ''

    headers: any[] = [
        {
            text: 'Identifier',
            align: 'left',
            sortable: false,
            value: 'id'
          },
          { text: 'Namespace', value: 'name' },
          { text: 'Engine', value: 'resource:spec_ports' }
        ]

    parser(json:any): GraphItem[] {
        const array = <object[]> json['executions']
        return array.map(obj => {
            let g = new GraphItem(undefined, undefined, undefined)
            g.id = obj['identifier']
            g.name = obj['namespace']
            g.properties.push({'key': 'engine', 'value': obj['engine']})
            return g
        })
    }

    addExec(event: Event): void {
        this.progress = true
        this.execDialog = false
        let payload = JSON.stringify({
          engine: this.exec_engine,
          namespace: this.exec_namespace
        })

        fetch('/api/deployer/contexts/' + this.$route.params.id + '/executions',
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
        })
    }

    onSelect(id) {
        //router.push("/deploy/context/" + id)
    }
}