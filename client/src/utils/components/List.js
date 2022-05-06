/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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

import React from "react";
import { Link } from "react-router-dom";
import { Col } from "reactstrap";
import Masonry from "react-masonry-css";

import { TimeCaption } from "./TimeCaption";
import { Pagination } from "./Pagination";
import EntityCreators from "./entities/Creators";
import EntityExecutions from "./entities/Executions";
import VisibilityIcon from "./entities/VisibilityIcon";
import EntityLabel from "./entities/Label";
import Slug from "./entities/Slug";
import EntityDescription from "./entities/Description";
import EntityTags from "./entities/Tags";
import { EntityButton } from "./entities/Buttons";
import { stylesByItemType } from "../helpers/HelperFunctions";

/**
 * ListCard/ListBar returns a card or a bar displaying an item in a List.
 *
 * @param creators - creators of the item, if more than 3 they will be cropped at 3.
 * @param description - description of the item.
 * @param itemType - type of the item being rendered, the color of the circle depends on this.
 * @param labelCaption - label to put inside the time caption of the item, if empty defaults to Updated.
 * @param slug - project namespace + id
 * @param tagList - list of the item's tags
 * @param timeCaption - date to put inside the time caption of the item.
 * @param title - title of the item.
 * @param url - containing a link to the item details.
 * @param visibility - visibility level
 */
function ListCard(props) {
  const {
    creators, description, executions, itemType, labelCaption, lastExecuted, slug, tagList, timeCaption,
    title, url, visibility, workflowType, imageUrl
  } = props;

  const imageStyles = imageUrl ? { backgroundImage: `url("${imageUrl}")` } : {};
  const colorByType = stylesByItemType(itemType);

  return (
    <div data-cy="list-card" className="col text-decoration-none p-2 rk-search-result-card">
      <Link to={url} className="col text-decoration-none">
        <div className="card card-entity">
          <div style={imageStyles}
            className={`card-header-entity ${!imageUrl ? `card-header-entity--${itemType}` : ""}`}>
            {!imageUrl ? <div className="card-bg-title">{title}</div> : null}
          </div>
          <EntityButton type={itemType} slug={slug} />
          <div className="card-body">
            <div className="card-title text-truncate lh-sm" data-cy="list-card-title">
              {title}
            </div>
            <Slug multiline={false} slug={slug} />
            <EntityCreators display="list" creators={creators} itemType={itemType} />
            <EntityExecutions display="list" executions={executions} itemType={itemType} lastExecuted={lastExecuted} />
            <EntityDescription
              description={description} isHeightFixed={true} showSuggestion={false} className="text-rk-text-light" />
            <EntityTags tagList={tagList} multiline={false} />
            <div className="d-flex align-items-center gap-3 card-small-text">
              <EntityLabel type={itemType} workflowType={workflowType} />
              <VisibilityIcon visibility={visibility} className={colorByType.colorText} />
            </div>
            <p className="card-text my-1">
              <TimeCaption caption={labelCaption || "Updated"} time={timeCaption} className="text-rk-text-light"/>
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
}

function ListBar(props) {

  const { url, title, description, tagList, timeCaption, labelCaption,
    mediaContent, creators, itemType, slug, visibility } = props;

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
        <Slug multiline={false} slug={slug} />
      </div>
      <EntityCreators display="bar" creators={creators} itemType={itemType} />
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

/**
 * This class receives a list of "items" and displays them either in a grid or in classic list.
 *
 * @param itemsType string containing the type of items in the list, this is only used to display an empty message.
 * @param search search function used inside the pagination.
 * @param currentPage current page used in the pagination.
 * @param gridDisplay if true the list will be displayed in grid mode.
 * @param totalItems total items, used in the pagination.
 * @param perPage items per page, used in the pagination.
 * @param items items to display, documented on top on ListCard.
 */
function ListDisplay(props) {

  const { currentPage, perPage, items, search, totalItems, gridDisplay, itemsType, gridColumnsBreakPoint } = props;

  if (!items || !items.length)
    return (<p>We could not find any matching {itemsType}s.</p>);

  const rows = gridDisplay ?
    items.map(item => <ListCard key={item.id} {...item} />)
    : items.map(item => <ListBar key={item.id} {...item} />);

  const onPageChange = (page) => { search({ page }); };
  const breakPointColumns = gridColumnsBreakPoint || {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  };

  return gridDisplay ?
    <div>
      <Masonry
        className="rk-search-result-grid mb-4"
        breakpointCols= {breakPointColumns}
      >
        {rows}
      </Masonry>
      <Pagination currentPage={currentPage} perPage={perPage} totalItems={totalItems} onPageChange={onPageChange}
        className="d-flex justify-content-center rk-search-pagination"/>
    </div>
    :
    <div>
      <div className="mb-4">{rows}</div>
      <Pagination currentPage={currentPage} perPage={perPage} totalItems={totalItems} onPageChange={onPageChange}
        className="d-flex justify-content-center rk-search-pagination"/>
    </div>;

}

export default ListDisplay;
