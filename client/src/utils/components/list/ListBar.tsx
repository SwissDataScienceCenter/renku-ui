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
import { Col } from "../../ts-wrappers";
import { ProjectTagList } from "../../../project/shared";
import { TimeCaption } from "../TimeCaption";
import { ListElementProps } from "./List.d";
import "./ListBar.css";
import { EntityButton, EntityIcon, VisibilityIcon } from "./List";
const Link = require("react-router-dom").Link;

function ListBar(
  { url,
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

  const mediaContentBox = mediaContent ?
    (
      <Col className="d-flex pt-4 flex-shrink-0 media-box" >
        {mediaContent ?
          <img src={mediaContent} width={100} alt="dataset image" className="card-img-bottom"/>
          : null
        }
      </Col>
    ) : null;
  return (<Link className="d-flex flex-row rk-search-result" to={url}>
    <div className="me-3 mt-2 d-flex flex-column align-items-center icons-box">
      <EntityIcon entityType={itemType}/>
      <div className="mt-4">
        <VisibilityIcon visibility={visibility}/>
      </div>
    </div>
    <Col className="d-flex align-items-start flex-column overflow-hidden">
      <div className="title d-inline-block text-truncate">
        {title}
        {
          slug ?
            <span className="slug font-weight-light text-rk-text ms-2">
              {slug}
            </span>
            : null
        }
      </div>
      {
        creators ?
          <div className="creators text-truncate text-rk-text">
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
      {
        timeCaption ?
          <div className="mt-auto">
            <TimeCaption caption={labelCaption || "Updated"} time={timeCaption} className="text-secondary"/>
          </div>
          : null
      }
      <div className="mt-3">
        {description}
      </div>
      {
        tagList ?
          <div className="tagList py-2">
            <ProjectTagList tagList={tagList} />
          </div>
          : null
      }
    </Col>
    {mediaContentBox}
    <Col className="d-flex flex-column flex-shrink-0 button-box">
      <div className="card-footer-left py-4">
        <EntityButton entityType={itemType} handler={handler} />
      </div>
    </Col>
  </Link>);
}

export default ListBar;
