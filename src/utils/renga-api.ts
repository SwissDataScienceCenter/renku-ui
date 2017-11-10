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

export function createContext(image: string, ports: string[], projectId?: number) {
    let payload = JSON.stringify({
        image: image,
        ports: ports
    })

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
            body: payload
        }
    )
}

export function runContext(engine: string, namespace: string, contextUUID: string) {

    let payload = JSON.stringify({
        engine: engine,
        namespace: namespace
    })

    return fetch(`./api/deployer/contexts/${contextUUID}/executions`,
        {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: payload
        }
    )
}

export function addFile(filename: string, bucketId: number, { fileInput = null, fileUrl = null } ) {

    let payload = JSON.stringify({
        file_name: filename,
        bucket_id: bucketId,
        request_type: 'create_file'
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

    return executeUpload(authorization, fileInput, fileUrl)
}

export function addFileVersion(fileId: number, { fileInput = null, fileUrl = null }) {
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
    return executeUpload(authorization, fileInput, fileUrl)
}

function executeUpload(authorization: Promise<any>, fileInput: any, fileUrl: string) {

    if ( (fileInput && fileUrl) || (!fileInput && !fileUrl) ) {
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
            }
        })
}
