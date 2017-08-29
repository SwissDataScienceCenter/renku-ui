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

import { GraphItem } from './graph-item'


@Component({
    template: require('./graph-item-list.html'),
    props: {
        url_list: String,
        url_details: String,
        icon: String,
        parser: null
    }
})
export class GraphItemListComponent extends Vue {

    url_details: string
    url_list: string
    icon: string
    parser: any

    item_list = {
        list: [],
        selected: null
    }

    progress: boolean = false
    detailsPanel: boolean = false

    created () {

        fetchItemList(this.url_list, '', this.parser).then(res => {
            if (res !== null) {
                this.item_list.list = res
            }
        })

    }

    itemSelect(item: GraphItem, event: Event): void {
        this.detailsPanel = true
        this.item_list.selected = item
    }

}

@Component({
    template: require('./graph-item-table.html'),
    props: {
        url_list: String,
        url_details: String,
        headers: Array,
        parser: null
    }
})
export class GraphItemTableComponent extends Vue {

    url_details: string
    url_list: string

    parser: any

    headers: any[]

    item_list = {
        list: [],
        selected: null
    }

    progress: boolean = false
    search: string = ''
    pagination: any = {}

    created () {

        fetchItemList(this.url_list, '', this.parser).then(res => {
            if (res !== null) {
                console.log('elements', res);

                this.item_list.list = res
            }
        })

    }

    itemSelect(item: GraphItem, event: Event): void {
        this.item_list.selected = item
    }

}

function fetchItemList(url: string, path: string, parser:any): Promise<null | GraphItem[]> {
    const headers = new Headers()
    // headers.append('pragma', 'no-cache')
    // headers.append('cache-control', 'no-cache')

    return fetch(url,
        {
            headers: headers,
            redirect: 'error',
            credentials: 'include'
        }
        ).then(response => {
        console.log(response.status, response.statusText)
        console.log(response)

        if (response.status === 401) {
            const redir = encodeURIComponent('/#' + path)
            window.location.replace(`./login?redir=${redir}`)
            return null
        }
        else if (response.status === 200) {
            return response.json().then(json => { return parser(json)})
        }

        throw new TypeError()
    }, err => {
        console.error(`Error: ${err}`)
        throw err
    })
}
