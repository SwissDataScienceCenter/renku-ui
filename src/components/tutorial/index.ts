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
import { GraphItem } from '../graph-item-list/graph-item'
import fetchItemList from '../graph-item-list'
import { UserState, NoUser, LoggedUser } from '../user'
import { Project }  from '../project'
import { FileObj }  from '../storage'


@Component({
    props: {
        user: undefined,
        project: undefined,
    },
    watch: {
      'user' : 'updateProjectList',
      'project' : 'updateDatasetList',
    },
    template: require('./tutorial.html')
})
export class TutorialComponent extends Vue {

    e1 = 1
    steps = 2

    project: Project
    user: UserState

    projectDialog = false
    project_name = ''
    projects: Project[] = []
    existingProject = 0

    datasets: any[] = []

    nextStep (n) {
        if (n === this.steps) {
          this.e1 = 1
        } else {
          this.e1 = n + 1
        }
    }

    constructor() {
        super()
        this.updateProjectList()
    }

    updateDatasetList(): void {
        let parser = json => {
            const array = <object[]> json
            return array.map(obj => {
                return new FileObj(obj)
            })
        }

        if (!(this.user instanceof NoUser)) {
            fetchItemList(`./api/explorer/projects/${this.project.id}/resources?resource=file`, '', parser).then(res => {
                if (res !== null) {
                    this.datasets = res
                }
            })
        }
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

    chooseProject(event: Event): void {
        for (let i = 0; i < this.projects.length; i ++) {
            if (this.projects[i].id === this.existingProject) {
                this.$emit('project_select', this.projects[i])
                this.e1 = 2
            }
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
            response.json().then(json => {
                this.updateProjectList()
                console.log('create_project', response)
                if (response.status === 201) {
                    this.$emit('project_select', new Project(json))
                    this.e1 = 2
                }
            })
        })
    }
}
