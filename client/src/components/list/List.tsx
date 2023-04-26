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
import "./ListCard.css";
import { ListElementProps, ListDisplayType } from "./List.d";
import ListCard from "./ListCard";
import ListBar from "./ListBar";

/**
 * ListCard/ListBar returns a card or a bar displaying an item in a List.
 *
 * @param props.creators creators of the entity, if more than 3 they will be cropped at 3.
 * @param props.description description of the entity.
 * @param props.itemType type of the entity being rendered, the color of the circle depends on this.
 * @param props.labelCaption label to put inside the time caption of the entity, if empty defaults to Updated.
 * @param props.mediaContent image of the entity.
 * @param props.slug slug of the entity.
 * @param props.tagList tag list of the entity.
 * @param props.timeCaption date to put inside the time caption of the entity.
 * @param props.title title of the entity.
 * @param props.type Type of visualization (Card, Bar).
 * @param props.url containing a link to the entity details.
 * @param props.visibility visibility of the entity.
 */
function List(props: ListElementProps) {
  const type = props.type;

  return type === ListDisplayType.Card ? (
    <ListCard {...props} />
  ) : (
    <ListBar {...props} />
  );
}

export default List;
