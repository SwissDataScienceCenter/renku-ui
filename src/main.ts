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

import * as Vue from 'vue'
import VueRouter from 'vue-router'
import lodash from 'lodash'
import Vuetify from 'vuetify'

import VueLodash from 'vue-lodash/dist/vue-lodash.min'

import * as mdc from 'material-components-web'

import { HomeComponent } from './components/home'
import { ContextComponent, ExecutionComponent } from './components/deploy'
import { BucketsComponent, FilesComponent } from './components/storage'
import { NavigationComponent } from './components/navigation'

import { UserMenuComponent, ProfileComponent } from './components/user'
import { GraphComponent } from './components/graph'
import { GraphItemListComponent, GraphItemTableComponent } from './components/graph-item-list'

// register the plugin
Vue.use(VueRouter)
Vue.use(Vuetify)
Vue.use(VueLodash, lodash)

Vue.component('user-menu', UserMenuComponent)

Vue.component('graph-display', GraphComponent)
Vue.component('graph-item-list', GraphItemListComponent)
Vue.component('graph-item-table', GraphItemTableComponent)

export const router = new VueRouter({
  routes: [
    { path: '/', component: HomeComponent },
    // { path: '/deploy', component: DeployComponent },
    { path: '/deploy/context', component: ContextComponent },
    { path: '/deploy/context/:id', component: ExecutionComponent },
    { path: '/storage', component: BucketsComponent },
    { path: '/storage/:id(\\d+)', component: FilesComponent },
    { path: '/graph', component: NavigationComponent },
    { path: '/profile', component: ProfileComponent }
  ],
})

new Vue({
  el: '#sdsc',
  router: router,
  data: {
    drawer: true,
    mini: false,
  },
  mounted() {
    document.getElementById('loading-sdsc').remove()
  }
})

mdc.autoInit()
