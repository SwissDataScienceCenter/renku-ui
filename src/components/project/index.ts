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
import { router } from '../../main'
import { GraphItem } from '../graph-item-list/graph-item'
import fetchItemList from '../graph-item-list'
import { Project}  from './project'
import { UserState, NoUser, LoggedUser } from '../user'

export * from './project'

@Component({
    props: {
        value: Project,
        user: undefined,
    },
    watch: {
        'user' : 'updateProjectList'
    },
    template: require('./project-selector.html')
})
export class ProjectSelectorComponent extends Vue {

    menu: boolean = false
    projectDialog: boolean = false

    project_name: String = ''

    value: Project | null
    user: UserState

    projects: Project[] = []

    constructor() {
        super()
        this.updateProjectList()
    }

    updateProjectList(): void {
        let parser = json => {
            const array = <object[]> json
            return array.map(obj => {
                return new Project(obj)
            })
        }

        if (!(this.user instanceof NoUser)) {
            fetchItemList(`./api/explorer/projects/user?userId=${(<LoggedUser> this.user).user.sub}`, '', parser).then(res => {
                if (res !== null) {
                    this.projects = res
                }
            })
        }
    }

    addProject(event: Event): void {
        this.projectDialog = false
        let payload = JSON.stringify({
          name: this.project_name,
        })

        fetch('./api/projects',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: payload
            }
        ).then(response => {
                console.log('create_project', response)
                this.updateProjectList()
        })
    }

    clickItem(project: Project): void {
        this.$emit('input', project)
    }

}
