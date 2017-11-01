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

    console.log(projectId)

    return fetch('./api/storage/authorize/create_bucket',
        {
            method: 'POST',
            credentials: 'include',
            headers: headers,
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

export function addFile(filename: string, bucketId: number, fileInput: any) {

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

    return executeUpload(authorization, fileInput)
}

export function addFileVersion(fileId: number, fileInput: any) {
    console.log(fileId)
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
    return executeUpload(authorization, fileInput)
}

function executeUpload(authorization: Promise<any>, fileInput: any) {
    return authorization
        .then(response => {
            return response.json()
        })
        .then(response => {
            console.log('create', response)
            let e = fileInput as HTMLInputElement
            const reader = new FileReader()
            reader.onload = () => {
                return fetch('./api/storage/io/write',
                    {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Authorization': 'Bearer ' + response.access_token
                        },
                        body: reader.result
                    }
                )
            }
            return reader.readAsArrayBuffer(e.files[0])
        })
}