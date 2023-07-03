/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

export interface RepositoryCommit {
  author_name: string;
  committed_date: string;
  id: string;
  message: string;
  web_url: string;
}

export interface GetRepositoryCommitParams {
  commitSha: string;
  projectId: string;
}

// {
//     "id": "0db8abcbab6036c2d5bb7cb70808908d7ad66bd6",
//     "short_id": "0db8abcb",
//     "created_at": "2023-06-30T08:05:48.000+00:00",
//     "parent_ids": [
//       "6f2116174b150d73efb272dadfec750d7d040c28"
//     ],
//     "title": "renku-ci-ui-2620.dev.renku.ch: config set interactive.mem_request",
//     "message": "renku-ci-ui-2620.dev.renku.ch: config set interactive.mem_request\n\nrenku-transaction: bd9d6b45e0324fde82bc56bbbd2001bf\n",
//     "author_name": "Johann-Michael Thiebaut",
//     "author_email": "johann.thiebaut@sdsc.ethz.ch",
//     "authored_date": "2023-06-30T08:05:48.000+00:00",
//     "committer_name": "renku 2.5.0",
//     "committer_email": "https://github.com/swissdatasciencecenter/renku-python/tree/v2.5.0",
//     "committed_date": "2023-06-30T08:05:48.000+00:00",
//     "trailers": {},
//     "web_url": "https://gitlab.dev.renku.ch/johann.thiebaut1/another-playground-project/-/commit/0db8abcbab6036c2d5bb7cb70808908d7ad66bd6",
//     "stats": {
//       "additions": 1,
//       "deletions": 0,
//       "total": 1
//     },
//     "status": "success",
//     "project_id": 100761,
//     "last_pipeline": {
//       "id": 326095,
//       "iid": 221,
//       "project_id": 100761,
//       "sha": "0db8abcbab6036c2d5bb7cb70808908d7ad66bd6",
//       "ref": "master",
//       "status": "success",
//       "source": "push",
//       "created_at": "2023-06-30T08:05:50.791Z",
//       "updated_at": "2023-06-30T08:06:09.154Z",
//       "web_url": "https://gitlab.dev.renku.ch/johann.thiebaut1/another-playground-project/-/pipelines/326095"
//     }
//   }
