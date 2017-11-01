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

import { addFile, addFileVersion, createBucket, runContext } from '../../utils/renga-api'
import { PersistedVertex } from '../graph/elements'


// The different dialog components could probably be unified further or at
// least share some some of their templates.

@Component({
    template: require('./project-dialog.html'),
    props: {
        projectId: {
            default: null
        }
    }
})

export class ProjectDialogComponent extends Vue {
    progress: boolean = false;
    bucketName: string = 'bucket';
    bucketBackend: string = 'local';
    projectId: number;

    addBucket(): void {
        this.progress = true;

        createBucket(this.bucketName, this.bucketBackend, this.projectId)
            .then(response => {
                console.log('create', response);
                this.progress = false;
                this.closeDialog();
                location.reload();

            })
    }
    closeDialog() {
        this.$emit('closeDialog');
    }
}


@Component({
    template: require('./execution-dialog.html'),
    props: {
        contextUUID: {
            required: true
        }
    }
})

export class ExecutionDialogComponent extends Vue {
    progress: boolean = false;
    engine: string = '';
    namespace: string = '';
    contextUUID: string;

    addExec(): void {
        this.progress = true;

        runContext(this.engine, this.namespace, this.contextUUID)
            .then(response => {
                return response.json()
            })
            .then(response => {
                console.log('create', response);
                this.progress = false;
                this.closeDialog();
                location.reload();
            })
    }
    closeDialog() {
        this.$emit('closeDialog');
    }
}


@Component({
    template: require('./bucket-dialog.html'),
    props: {
        bucketId: {
            type: Number,
            required: true
        }
    }
})

export class BucketDialogComponent extends Vue {
    progress: boolean = false;
    filename: string = '';
    bucketfile: string = '';
    bucketId: number;

    addFile() {
        this.progress = true;
        addFile(this.bucketfile, this.bucketId, this.$refs.fileInput)
            .then(() => {
                this.progress = false;
                this.closeDialog();
                location.reload();
            })
    }

    closeDialog() {
        this.$emit('closeDialog');
    }

    onFileChange($event) {
        onFileChange($event, this)
    }

    onFocus() {
        onFocus(this)
    }
}


@Component({
    template: require('./version-dialog.html'),
    props: {
        selectedFileId: {
            type: Number,
            required: true
        }

    }
})

export class VersionDialogComponent extends Vue {
    progress: boolean = false;
    filename: string = '';
    selectedFileId: number;

    addFileVersion() {
        this.progress = true;
        addFileVersion(this.selectedFileId, this.$refs.fileInput)
            .then(() => {
                this.progress = false;
                this.closeDialog();
                location.reload();
            })
    }

    closeDialog() {
        this.$emit('closeDialog');
    }

    onFileChange($event) {
        onFileChange($event, this)
    }

    onFocus() {
        onFocus(this)
    }
}


function onFileChange($event, context) {
    let files = $event.target.files || $event.dataTransfer.files;
    if (files) {
        context.filename = '';
        for (let j = 0; j < files.length; j++) {
            context.filename += `${files[j]['name']} `
        }
    } else {
        context.filename = $event.target.value.split('\\').pop();
    }
    context.$emit('input', context.filename);
}


function onFocus(context) {
    let e = context.$refs.fileInput as HTMLElement;
    e.click();
}