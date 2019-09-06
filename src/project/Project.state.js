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

/**
 *  incubator-renku-ui
 *
 *  Project.state.js
 *  Redux-based state-management code.
 */

import { UserState } from '../app-state';
import { API_ERRORS } from '../api-client';
import { StateModel} from '../model/Model';
import { projectSchema } from '../model/RenkuModels';
import { SpecialPropVal } from '../model/Model'
import { isNullOrUndefined } from 'util';
import { splitAutosavedBranches } from '../utils/HelperFunctions'


const GraphIndexingStatus = {
  NO_WEBHOOK: -2,
  NO_PROGRESS: -1,
  MIN_VALUE: 0,
  MAX_VALUE: 100
};

class ProjectModel extends StateModel {
  constructor(stateBinding, stateHolder, initialState) {
    super(projectSchema, stateBinding, stateHolder, initialState)
  }

  stopCheckingWebhook() {
    this.set('webhook.stop', true);
  }

  fetchGraphWebhook(client, user) {
    if (user == null) {
      this.set('webhook.possible', false);
    }
    const userIsOwner = this.get('core.owner.id') === user.id;
    this.set('webhook.possible', userIsOwner);
    if (userIsOwner) {
      this.fetchGraphWebhookStatus(client, this.get('core.id'));
    }
  }

  fetchGraphStatus(client) {
    return client.checkGraphStatus(this.get('core.id'))
      .then((resp) => {
        let progress;
        if (resp.progress == null) {
          progress = GraphIndexingStatus.NO_PROGRESS;
        }
        if (resp.progress === 0 || resp.progress) {
          progress = resp.progress;
        }
        this.set('webhook.progress', progress);
        return progress;
      })
      .catch((err) => {
        if (err.case === API_ERRORS.notFoundError) {
          const progress = GraphIndexingStatus.NO_WEBHOOK;
          this.set('webhook.progress', progress);
          return progress;
        }
        else {
          throw err;
        }
      });
  }

  fetchGraphWebhookStatus(client) {
    this.set('webhook.created', false);
    this.setUpdating({webhook: {status: true}});
    return client.checkGraphWebhook(this.get('core.id'))
      .then((resp) => {
        this.set('webhook.status', resp);
      })
      .catch((err) => {
        this.set('webhook.status', err);
      });
  }

  createGraphWebhook(client) {
    this.setUpdating({webhook: {created: true}});
    return client.createGraphWebhook(this.get('core.id'))
      .then((resp) => {
        this.set('webhook.created', resp);
      })
      .catch((err) => {
        this.set('webhook.created', err);
      });
  }

  // TODO: Do we really want to re-fetch the entire project on every change?
  fetchProject(client, projectPathWithNamespace) {
    this.setUpdating({core: {available: true}});
    return client.getProject(projectPathWithNamespace, {statistics: true})
      .then(resp => resp.data)
      .then(d => {
        const updatedState = {
          core: { ...d.metadata.core, available: true },
          system: d.metadata.system,
          visibility: d.metadata.visibility,
          statistics: d.metadata.statistics
        };
        this.setObject(updatedState);
        return d;
      })
      .catch(err => {
        if (err.case === API_ERRORS.notFoundError) {
          this.set('core.available', false);
        }
        else throw err;
      });
  }

  initialFetchProjectFilesTree(client, openFilePath , openFolder ){
    this.setUpdating({transient:{requests:{filesTree: true}}});
    return client.getProjectFilesTree(this.get('core.id'), openFilePath)
      .then(d => {
        const updatedState = { filesTree: d, transient:{requests:{filesTree: false}} };
        this.setObject(updatedState);
        this.set('filesTree', d);
        return d;
      })
      .then(d=> {
        return this.returnTreeOrFetchNext(client, openFilePath, openFolder, d)
      });
  }

  deepFetchProjectFilesTree(client, openFilePath, openFolder, oldTree){
    this.setUpdating({transient:{requests:{filesTree: true}}});
    return client.getProjectFilesTree(this.get('core.id'), openFilePath, openFolder, oldTree.lfsFiles)
      .then(d => {
        const updatedState = this.insertInParentTree(oldTree, d, openFolder);
        this.setObject(updatedState);
        this.set('filesTree', oldTree);
        return oldTree;
      }).then(d=> {
        return this.returnTreeOrFetchNext(client, openFilePath, openFolder, d)
      });
  }

  returnTreeOrFetchNext(client, openFilePath, openFolder, tree){
    if(openFilePath !== undefined && openFilePath.split('/').length > 1){
      const openFilePathArray = openFilePath.split('/');
      const goto = openFolder !== undefined ?
        openFolder + "/" +openFilePathArray[0]
        : openFilePathArray[0];
      return this.fetchProjectFilesTree(client, openFilePath.replace(openFilePathArray[0],''), goto);
    } else {
      return tree;
    }
  }

  cleanFilePathUrl(openFilePath){
    if(openFilePath.startsWith('/'))
      return openFilePath = openFilePath.substring(1);
    else return openFilePath;
  }

  insertInParentTree(parentTree, newTree , openFolder){
    parentTree.hash[openFolder].treeRef.children=newTree.tree;
    parentTree.hash[openFolder].childrenLoaded=true;
    parentTree.hash[openFolder].childrenOpen = true;
    for (const node in newTree.hash)
      parentTree.hash[node] = newTree.hash[node];
    return { filesTree: parentTree, transient:{requests:{filesTree: false}} };
  }

  fetchProjectFilesTree(client, openFilePath, openFolder){
    if (this.get('transient.requests.filesTree') === SpecialPropVal.UPDATING) return;
    const oldTree = this.get('filesTree');
    openFilePath = this.cleanFilePathUrl(openFilePath);
    if(isNullOrUndefined(oldTree)){
      return this.initialFetchProjectFilesTree(client, openFilePath , openFolder);
    } else {
      if(openFolder !== undefined && oldTree.hash[openFolder].childrenLoaded === false) {
        return this.deepFetchProjectFilesTree(client, openFilePath , openFolder, oldTree)
      } else {
        return oldTree;
      }
    }
  }

  setProjectOpenFolder(client, folderPath){
    let filesTree = this.get('filesTree');
    if (filesTree.hash[folderPath].childrenLoaded === false){
      this.fetchProjectFilesTree(client,"",folderPath);
    }
    filesTree.hash[folderPath].childrenOpen = !filesTree.hash[folderPath].childrenOpen;
    this.set('filesTree',filesTree);
  }

  fetchModifiedFiles(client) {
    client.getModifiedFiles(this.get('core.id'))
      .then(d => {
        this.set('files.modifiedFiles', d)
      })
  }

  fetchMergeRequests(client) {
    this.setUpdating({system: {merge_requests: true}});
    client.getMergeRequests(this.get('core.id'))
      .then(resp => resp.data)
      .then(d => {
        this.set('system.merge_requests', d)
      })
  }

  fetchBranches(client) {
    this.setUpdating({system: {branches: true}});
    return client.getBranches(this.get('core.id'))
      .then(resp => resp.data)
      .then(data => {
        // split away autosaved branches and add external url
        const { standard, autosaved } = splitAutosavedBranches(data);
        this.set('system.branches', standard);
        const externalUrl = this.get('core.external_url');
        const autosavedUrl = autosaved.map(branch => {
          const url = `${externalUrl}/tree/${branch.name}`;
          branch.autosave.url = url;
          return branch;
        });
        this.set('system.autosaved', autosavedUrl);

        return standard;
      })
  }

  fetchReadme(client) {
    // Do not fetch if a fetch is in progress
    if (this.get('transient.requests.readme') === SpecialPropVal.UPDATING) return;

    this.setUpdating({transient:{requests:{readme: true}}});
    client.getProjectReadme(this.get('core.id'))
      .then(d => this.set('data.readme.text', d.text))
      .catch(error => {
        if (error.case === API_ERRORS.notFoundError) {
          this.set('data.readme.text', 'No readme file found.')
        }
      })
      .finally(() => this.set('transient.requests.readme', false))
  }

  refreshUserProjects(client, userStateDispatch) {
    client.getProjects({membership: true, order_by: 'last_activity_at'})
      .then(p => userStateDispatch(UserState.reSetMember(p)));
  }

  setTags(client, tags, userStateDispatch) {
    this.setUpdating({system: {tag_list: [true]}});
    client.setTags(this.get('core.id'), this.get('core.title'), tags)
      .then(() => { this.fetchProject(client, this.get('core.id'));})
      .then(()=> this.refreshUserProjects(client, userStateDispatch))
  }

  setDescription(client, description, userStateDispatch) {
    this.setUpdating({core: {description: true}});
    client.setDescription(this.get('core.id'), this.get('core.title'), description).then(() => {
      this.fetchProject(client, this.get('core.id'));
    }).then(()=> this.refreshUserProjects(client, userStateDispatch))
  }

  toogleForkModal() {
    let forkModalOpen = this.get('forkModalOpen');
    this.set("forkModalOpen" , forkModalOpen === undefined || forkModalOpen === false ? true : false);
  }

  star(client, userStateDispatch, starred) {
    client.starProject(this.get('core.id'), starred).then(() => {
      // TODO: Bad naming here - will be resolved once the user state is re-implemented.
      this.fetchProject(client, this.get('core.id'))
        .then(p => userStateDispatch(UserState.star(p.metadata.core)))
    })
  }
}

export { ProjectModel, GraphIndexingStatus };
