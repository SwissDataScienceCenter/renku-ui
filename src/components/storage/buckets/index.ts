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
                    return new GraphItem(obj, 'resource:bucket_name', 'resource:bucket_backend')
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