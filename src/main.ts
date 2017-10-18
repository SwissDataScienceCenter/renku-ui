/*!
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
import VueRouter from 'vue-router'
import Vuetify from 'vuetify'
import Component from 'vue-class-component'

import { HomeComponent } from './components/home'
import { ContextComponent, ExecutionComponent, DetailExecutionComponent } from './components/deploy'
import { BucketsComponent, FilesComponent } from './components/storage'
import { NavigationComponent } from './components/navigation'

import { UserMenuComponent, ProfileComponent, UserState, NoUser } from './components/user'
import { ProjectSelectorComponent, Project } from './components/project'
import { GraphComponent } from './components/graph'
import { GraphItemListComponent, GraphItemTableComponent } from './components/graph-item-list'

// Vuetify style
require('./main.styl')

// register the plugin
Vue.use(VueRouter)
Vue.use(Vuetify)

Vue.component('user-menu', UserMenuComponent)
Vue.component('project-selector', ProjectSelectorComponent)

Vue.component('graph-display', GraphComponent)
Vue.component('graph-item-list', GraphItemListComponent)
Vue.component('graph-item-table', GraphItemTableComponent)

export const router = new VueRouter({
  routes: [
    { path: '/', component: HomeComponent },
    // { path: '/deploy', component: DeployComponent },
    { path: '/deploy/context', component: ContextComponent },
    { path: '/deploy/context/:id', component: ExecutionComponent },
    { path: '/deploy/context/:id/execution/:eid', component: DetailExecutionComponent },
    { path: '/storage', component: BucketsComponent },
    { path: '/storage/:id(\\d+)', component: FilesComponent },
    { path: '/graph', component: NavigationComponent },
    { path: '/profile', component: ProfileComponent }
  ],
})

@Component({})
class MainComponent extends Vue {

    drawer: boolean = true
    mini: boolean = false
    project: Project | null = null
    user: UserState = new NoUser

  doLogin (user: UserState): void {
    this.user = user
  }

  doLogout (user: UserState): void {
    this.user = user
  }

}

new MainComponent({el: '#sdsc', router: router})
