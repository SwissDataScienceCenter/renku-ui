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
import { router } from '../../main'
import Component from 'vue-class-component'
import { GraphItem } from '../graph-item-list/graph-item'
import fetchItemList from '../graph-item-list'
import { UserState, NoUser, LoggedUser } from '../user'
import { Project }  from '../project'
import { FileObj, Bucket }  from '../storage'


@Component({
    props: {
        user: undefined,
        project: undefined,
    },
    watch: {
      'user' : 'updateProjectList',
      'project' : 'updateDatasetList',
      'searchImport': 'applyFilter',
    },
    template: require('./tutorial.html')
})
export class TutorialComponent extends Vue {

    e1 = 1
    steps = 2
    step_names = ['Project', 'Data', 'Execution']
    progress = false

    project: Project
    user: UserState

    projectDialog = false
    project_name = ''
    projects: Project[] = []
    existingProject = 0

    datasets_import: any[] = []
    datasets_local: any[] = []
    datasets_buckets: any[] = []
    datasets_all: any[] = []
    datasets_filter: any[] = []

    fileDialog: boolean = false
    bucketfile: string = ''
    filename: string = ''

    importDialog = false
    searchImport = ''

    imageIDE = ''
    imageDocker = ''
    portsDocker = ''
    envDocker = ''
    baseCode = ''
    repositoryCode = ''
    envCode = ''

    dockers(): any {

        let nb_token = Math.random().toString(36).slice(2)

        return {
            'jupyter': {
                command: `start-notebook.sh --NotebookApp.ip='*' --NotebookApp.token=${nb_token} --NotebookApp.contents_manager_class=renga.notebook.RengaStorageManager`,
                ports: ['8888'],
                image: 'rengahub/minimal-notebook:latest',
                labels: [`renga.notebook.token=${nb_token}`]
                },
            'rstudio': {
                image: 'rocker/rstudio',
                ports: ['8787']
            }
        }
    }


    inputNextStep () {
        this.steps = 3
        this.e1 = 3
    }

    parser = json => {
            const array = <object[]> json
            return array.map(obj => {
                return new FileObj(obj)
            })
        }

    constructor() {
        super()
        this.updateProjectList()
    }

    openImportDialog(): void {
        fetchItemList(
            `./api/explorer/graph/nodes/resource:file_name`,
            '',
            this.parser,
        ).then(res => {
            if (res !== null) {
                this.datasets_all = res
                this.importDialog = true
            }
        })
    }

    applyFilter(): void {
        let that = this
        this.datasets_filter = this.datasets_all.filter(function (item) {
            return item.name.search(new RegExp(that.searchImport, 'i')) >= 0
        }).slice(0, 5)
    }

    updateDatasetList(): void {
        this.progress = true

        let bparser = json => {
            const array = <object[]> json
            return array.map(obj => {
                return new Bucket(obj)
            })
        }

        let lparser = json => {
            const array = <object[]> json
            return array.map(obj => {
                let o = obj['vertex']
                if (o['types'][0] === 'resource:file') {
                    return new FileObj(o)
                }
                return null
            })
        }

        if (!(this.user instanceof NoUser)) {
            this.datasets_local = []
            fetchItemList(`./api/explorer/lineage/project/${this.project.id}/`, '', lparser).then(res => {
                if (res !== null) {
                    this.datasets_import = res.filter(n => n)
                }
            })
            fetchItemList(`./api/explorer/projects/${this.project.id}/resources?resource=bucket`, '', bparser).then(res => {
                if (res !== null) {
                    this.datasets_buckets = res
                    for (let i = 0; i < res.length; i++) {
                        fetchItemList(`./api/explorer/storage/bucket/${res[i].id}/files`, '', this.parser).then(result => {
                            this.datasets_local = this.datasets_local.concat(result)
                        })
                    }
                    this.progress = false
                }
            })
        }
    }

    updateProjectList(): void {
        let pparser = json => {
            const array = <object[]> json
            return array.map(obj => {
                return new Project(obj)
            })
        }

        if (!(this.user instanceof NoUser)) {
            fetchItemList(`./api/explorer/projects/user?userId=${(<LoggedUser> this.user).user.sub}`, '', pparser).then(res => {
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
                let p = new Project(json)
                this.$emit('project_select', p)
                if (response.status === 201) {
                    let payload = JSON.stringify({
                        name: this.project_name,
                        backend: 'local',
                        request_type: 'create_bucket'
                    })

                    fetch('./api/storage/authorize/create_bucket',
                        {
                            method: 'POST',
                            headers: {
                                'Renga-Projects-Project': p.id,
                                'Content-Type': 'application/json'
                            },
                            credentials: 'include',
                            body: payload
                        }
                    ).then(response => {
                            console.log('create_bucket', response)
                            this.e1 = 2
                    })
                }
            })
        })
    }

    addFile(event: Event): void {
        this.progress = true
        this.fileDialog = false
        let payload = JSON.stringify({
            file_name: this.bucketfile,
            bucket_id: this.datasets_buckets[0].id,
            request_type: 'create_file'
        })

        fetch('./api/storage/authorize/create_file',
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
            let e = this.$refs.fileInput as HTMLInputElement
            const reader = new FileReader()
            reader.onload = aFile => {
                fetch('./api/storage/io/write',
                    {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Authorization': 'Bearer ' + response.access_token
                        },
                        body: reader.result
                    }
                ).then(r => {
                    this.updateDatasetList()
                    this.progress = false
                })
            }
            reader.readAsArrayBuffer(e.files[0])
        })

    }

    onFocus() {
        let e = this.$refs.fileInput as HTMLElement
        e.click()
    }

    onFileChange($event) {
        const files = $event.target.files || $event.dataTransfer.files;
        if (files) {
            this.filename = ''
            for (let j = 0; j < files.length; j++) {
                this.filename += `${files[j]['name']} `
            }
        } else {
            this.filename = $event.target.value.split('\\').pop();
        }
        this.$emit('input', this.filename);
    }

    addImport(item: any): void {
        this.importDialog = false
        let payload = JSON.stringify({
          resource: item.id,
        })

        fetch(`./api/projects/${this.project.id}/imports`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: payload
            }
        ).then(response => {
            this.updateDatasetList()
        })
    }

    do_execution(_payload, _env): void {
        this.progress = true

        fetch('./api/deployer/contexts',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(_payload)
            }
        ).then(response => {
            return response.json()
            }
        ).then(response => {
            let payload = JSON.stringify({
              engine: 'docker',
              namespace: 'namespace',
              environment: _env.split(/\s*,\s*/).reduce(function(prev, curr) {let a = curr.split(/\s*=\s*/); prev[a[0]] = a[1]; return prev}, { })
            })

            fetch(`./api/deployer/contexts/${response.identifier}/executions`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: payload
                }
            ).then(response2 => {
                return response2.json()
                }
            ).then(response2 => {
                console.log('executing', response2)
                this.progress = false
                router.push(`/deploy/context/${response.identifier}/execution/${response2.identifier}`)
            })
        })
    }

    executeIDE() {
        this.do_execution(this.dockers()[this.imageIDE], '')

    }

    executeDocker() {
        let payload = {
          image: this.imageDocker,
          ports: this.portsDocker.split(/\s*,\s*/)
        }

        this.do_execution(payload, this.envDocker)
    }

    executeCode() {

    }
}
