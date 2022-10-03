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
import { TimeCaption } from "../TimeCaption";
import { ListElementProps } from "./List.d";
import "./ListBar.css";
import Slug from "../entities/Slug";
import EntityCreators from "../entities/Creators";
import EntityTags from "../entities/Tags";
import VisibilityIcon from "../entities/VisibilityIcon";
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
    itemType,
    visibility
  }: ListElementProps) {

  return <Link className="d-flex flex-row rk-search-result" to={url}>
    <div className="me-3 mt-2 d-flex flex-column align-items-center">
      <div>
        <span className={"circle " + itemType}> </span>
      </div>
      <div>
        <VisibilityIcon visibility={visibility} className="card-visibility-icon--bar" />
      </div>
    </div>
    <Col className="d-flex align-items-start flex-column col-10 overflow-hidden">
      <div className="title d-inline-block text-truncate">
        {title}
        <Slug display="grid" slug={slug} />
      </div>
      <EntityCreators display="grid" creators={creators} itemType={itemType} />
      <div className="description card-description text-truncate text-rk-text d-flex">
        {description}
      </div>
      <EntityTags tagList={tagList} multiline={false} />
      {
        timeCaption ?
          <div className="mt-auto">
            <TimeCaption caption={labelCaption || "Updated"} time={timeCaption} className="text-secondary"/>
          </div>
          : null
      }
    </Col>
    <Col className="d-flex justify-content-end align-self-center flex-shrink-0">
      {mediaContent ?
        <img src={mediaContent} alt=" " className="card-img-bottom"/>
        : null
      }
    </Col>
  </Link>;
}

export default ListBar;
