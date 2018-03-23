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



export function createBucket(bucketName: string, bucketBackend: string, projectId?: number) {

    let payload = JSON.stringify({
        name: bucketName,
        backend: bucketBackend,
        request_type: 'create_bucket'
    })

    let headers = {
        'Content-Type': 'application/json'
    }

    if (projectId) {
        headers['Renga-Projects-Project'] = projectId
    }

    return fetch('./api/storage/authorize/create_bucket',
        {
            method: 'POST',
            credentials: 'include',
            headers: headers,
            body: payload
        }
    )
}

export function createContext(image: string, ports: string[], labels: string[] = [], projectId?: number,
                              notebookId?: number) {
    let postData = {
        image: image,
        ports: ports,
        labels: labels
    }

    let isNotebookImage = image.includes('rengahub/') && image.includes('-notebook')

    if (isNotebookImage) {

        if (notebookId) postData.labels.push(`renga.context.inputs.notebook=${notebookId}`)

        // This is a bit clumsy (the now deprecated npm crypto package on npm had
        // simple to use randomBytes method.
        let token = ''
        let randomBytes: any = crypto.getRandomValues(new Uint32Array(6))
        randomBytes.forEach(i => {
                token += i.toString(16)
            })

        postData.labels.push(`renga.notebook.token=${token}`)
        postData['command'] = 'sh -c "start-notebook.sh ' +
            '--ContentsManager.untitled_notebook=notebook ' +
            '--NotebookApp.ip=\'*\' ' +
            `--NotebookApp.token=${token} ` +
            '--NotebookApp.contents_manager_class=renga.notebook.RengaStorageManager ' +
            '--NotebookApp.base_url=${DEPLOYER_BASE_URL}"'
    }

    let headers = {
        'Content-Type': 'application/json'
    }

    if (projectId) {
        headers['Renga-Projects-Project'] = projectId
    }

    return fetch('./api/deployer/contexts',
        {
            method: 'POST',
            headers: headers,
            credentials: 'include',
            body: JSON.stringify(postData)
        }
    )
}

export function getContext(contextUUID: string) {
    return fetch( `./api/deployer/contexts/${contextUUID}`,
        {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            return response.json()
        })
}

export function runContext(engine: string, namespace: string, contextUUID: string, environment?: object) {

    let payload = {
        engine: engine,
        namespace: namespace,
    }

    if (environment) payload['environment'] = environment

    return fetch(`./api/deployer/contexts/${contextUUID}/executions`,
        {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }
    )
}

export function addFile(filename: string, bucketId: number, labels: string[], { fileInput = null, fileUrl = null, fileObj = null } ) {

    let payload = JSON.stringify({
        file_name: filename,
        bucket_id: bucketId,
        request_type: 'create_file',
        labels: labels
    })

    // Let's be explicit here to make clear it's a promise...
    let authorization: Promise<any> = fetch('./api/storage/authorize/create_file',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: payload
        }
    )

    return executeUpload(authorization, fileInput, fileUrl, fileObj)
}

export function addFileVersion(fileId: number, { fileInput = null, fileUrl = null, fileObj = null }) {
    let payload = JSON.stringify({
        resource_id: fileId,
        request_type: 'write_file'
    })

    // Let's be explicit here to make clear it's a promise...
    let authorization: Promise<any> = fetch('./api/storage/authorize/write',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: payload
        }
    )
    return executeUpload(authorization, fileInput, fileUrl, fileObj)
}

function executeUpload(authorization: Promise<any>, fileInput: any, fileUrl: string, fileObj: File) {

    if ( (fileInput && fileUrl && fileObj) || (!fileInput && !fileUrl && !fileObj) ) {
        throw('You have to provide either a file input or a url')
    }

    let postRequest: RequestInit = {
        method: 'POST',
        credentials: 'include',
        headers: {
        }
    }

    // Get request is used if file ist fetched from URL
    let getRequest: RequestInit = {
        method: 'GET',
        credentials: 'include',
        headers: {
            'fileUrl': fileUrl,
        }
    }

    return authorization
        .then( response => response.json())
        .then( response => {
            console.log('create', response)
            postRequest.headers['Authorization'] = 'Bearer ' + response.access_token

            if (fileInput) {

                // TODO: reject if reader fails
                let readerPromise = new Promise( resolve => {
                    let e = fileInput as HTMLInputElement
                    let reader = new FileReader()
                    reader.onload = () => {
                        postRequest['body'] = reader.result
                        resolve( fetch('./api/storage/io/write', postRequest) )
                    }
                    reader.readAsArrayBuffer(e.files[0])
                })
                return readerPromise

            } else if (fileUrl) {
                return fetch('./webproxy', getRequest)
                    .then( response => response.blob())
                    .then(blob => {
                        postRequest['body'] = blob
                        return fetch('./api/storage/io/write', postRequest)
                    })

            } else if (fileObj) {

                // TODO: reject if reader fails
                let readerPromise = new Promise( resolve => {
                    let e = fileInput as HTMLInputElement
                    let reader = new FileReader()
                    reader.onload = () => {
                        postRequest['body'] = reader.result
                        resolve( fetch('./api/storage/io/write', postRequest) )
                    }
                    reader.readAsArrayBuffer(fileObj)
                })
                return readerPromise
            }
        })
}

export function duplicateFile(fileID: number, bucketID: number, filename: string, projectId?: number) {

    let payload = JSON.stringify({
        resource_id: fileID,
        bucket_id: bucketID,
        file_name: filename,
        labels: [`copy of ${fileID}`],
        request_type: 'copy_file'
    })

    let headers = {
        'Content-Type': 'application/json'
    }

    if (projectId) {
        headers['Renga-Projects-Project'] = projectId
    }

    return fetch('./api/storage/authorize/copy_file',
        {
            method: 'POST',
            credentials: 'include',
            headers: headers,
            body: payload
        }
    )
}

export function getProjectResources(projectId: number) {
    return fetch( `./api/explorer/projects/${projectId}/resources`,
        {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json()
            } else {
                return []
            }
        })
}

export function getBucketBackends() {
    return fetch( './api/storage/io/backends',
        {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            return response.json()
        })
}

export function getBucketFiles(bucketId: number) {
    return fetch( `./api/explorer/storage/bucket/${bucketId}/files?n=100`,
        {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            return response.json()
        })
}

export function getBucketNotebooks(bucketId: number) {
    return fetch( `./api/explorer/storage/bucket/${bucketId}/notebooks`,
        {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            return response.json()
        })
}

export function getProjects() {
    return fetch( `./api/explorer/projects`,
        {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            return response.json()
        })
}

export function getProjectFiles(projectId: number, onlyNB: boolean) {
    return getProjectResources(projectId)
        .then(responseJSON => {
            return responseJSON
                .filter( (item) => {
                    return item.types.indexOf('resource:bucket') >= 0
                })
                .map( (bucketResource) => {
                    if (onlyNB) {
                        return getBucketNotebooks(bucketResource.id)
                    } else {
                        return getBucketFiles(bucketResource.id)
                    }
                })
        })
}

export function updateFile(fileId: number, fileName: string = null, labels: string[] = null) {
    let body = {}

    if (fileName) {
        body['file_name'] = fileName
    }

    // Note that an empty array evaluates to true
    if (labels) {
        body['labels'] = labels
    }

    return fetch(`./api/storage/file/${fileId}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(body)
        }
    )
}
