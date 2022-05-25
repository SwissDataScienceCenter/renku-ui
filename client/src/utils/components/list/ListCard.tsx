/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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
import * as React from "react";
import { Fragment } from "react";

import { ProjectTagList } from "../../../project/shared";
import { TimeCaption } from "../TimeCaption";
import { EntityButton, EntityIcon, VisibilityIcon } from "./List";
import { ListElementProps } from "./List.d";
import "./ListCard.css";

const Link = require("react-router-dom").Link;

function ListCard(
  {
    url,
    title,
    description,
    tagList,
    timeCaption,
    labelCaption,
    mediaContent,
    creators,
    slug,
    handler,
    itemType,
    visibility
  }: ListElementProps) {

  return (
    <div data-cy="list-card" className="col text-decoration-none p-4 rk-search-result-card list-card rounded-3">
      <Link to={url} className="col text-decoration-none">
        <div className="card card-body border-0">
          <div className="mt-2 mb-2 d-flex align-items-center">
            <EntityIcon entityType={itemType}/>
            <div className="px-2 d-flex align-items-center" >
              <VisibilityIcon visibility={visibility}/>
            </div>
          </div>
          <div className="card-title" data-cy="list-card-title">
            {title}
          </div>
          {
            slug ?
              <div className="card-text creators text-rk-text mt-1">
                <small style={{ display: "block" }} className="font-weight-light">
                  {slug}
                </small>
              </div>
              : null
          }
          {
            creators && creators.length ?
              <div className="card-text creators text-truncate text-rk-text mt-1">
                <small style={{ display: "block" }} className="font-weight-light">
                  {Array.isArray(creators) ?
                    creators.slice(0, 3).map((creator) => creator.name).join(", ") :
                    creators
                  }
                  {Array.isArray(creators) && creators.length > 3 ? ", et al." : null}
                </small>
              </div>
              : null
          }
          <div>
            <p className="card-text ">
              <TimeCaption caption={labelCaption || "Updated"} time={timeCaption} className="text-secondary small"/>
            </p>
          </div>
          <div className="card-text text-rk-text mt-3 mb-2">
            {description ? description : null}
          </div>
          {tagList && tagList.length > 0 ?
            <Fragment>
              <div className="tagList mt-auto mb-2">
                <ProjectTagList tagList={tagList} />
              </div>
            </Fragment> : null}
          {mediaContent ? <img src={mediaContent} alt=" " className="card-img-bottom mt-2"/> : null}
        </div>
      </Link>
      <div className="card-footer d-flex align-items-center justify-content-end">
        <div className="card-footer-left">
          <EntityButton entityType={itemType} handler={handler} />
        </div>
      </div>
    </div>
  );
}

export default ListCard;
