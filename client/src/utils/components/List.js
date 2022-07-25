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

import React, { Fragment, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { Col } from "reactstrap";
import Masonry from "react-masonry-css";
import { faGlobe, faLock, faUserFriends } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ProjectTagList } from "../../project/shared";
import { TimeCaption } from "./TimeCaption";
import { Pagination } from "./Pagination";
import { ThrottledTooltip } from "./Tooltip";
import AppContext from "../context/appContext";

const VisibilityIcon = ({ visibility }) => {
  const ref = useRef(null);
  const { client } = useContext(AppContext);
  if (!visibility) return null;
  const icon = {
    public: <FontAwesomeIcon icon={faGlobe} />,
    private: <FontAwesomeIcon icon={faLock} />,
    internal: <FontAwesomeIcon icon={faUserFriends} />
  };
  const baseUrl = client.baseUrl;
  const { hostname } = baseUrl ? new URL(baseUrl) : { hostname: "renkulab.io" };

  const tooltip = {
    public: "Public: Anyone can access your project.",
    private: "Private: Only members explicitly added to this project can access it.",
    internal: `Internal: Anyone signed-in to ${hostname} can access your project.` //pending for other deployments
  };

  const style = {
    position: "relative",
    top: "-3px"
  };

  return <>
    <span ref={ref} className="text-rk-text" style={style}>
      { icon[visibility] || "" }
    </span>
    <ThrottledTooltip
      target={ref}
      tooltip={tooltip[visibility]} />
  </>;
};

/**
 * ListCard/ListBar returns a card or a bar displaying an item in a List.
 *
 * @param url containing a link to the item details.
 * @param title title of the item.
 * @param description description of the item.
 * @param tagList tag list of the item.
 * @param timeCaption date to put inside the time caption of the item.
 * @param labelCaption label to put inside the time caption of the item, if empty defaults to Updated.
 * @param mediaContent image of the item.
 * @param creators creators of the item, if more than 3 they will be cropped at 3.
 * @param itemType type of the item being rendered, the color of the circle depends on this.
 */
function ListCard(props) {
  const { url, title, description, tagList, timeCaption,
    labelCaption, mediaContent, creators, itemType, slug, visibility } = props;
  return (
    <div data-cy="list-card" className="col text-decoration-none p-2 rk-search-result-card">
      <Link to={url} className="col text-decoration-none">
        <div className="card card-body border-0">
          <div className="mt-2 mb-2">
            <span className={"circle me-1 " + itemType}> </span>
            <VisibilityIcon visibility={visibility} />
          </div>
          <div className="title lh-sm" data-cy="list-card-title">
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
            creators ?
              <div className="card-text creators text-truncate text-rk-text mt-1">
                <small style={{ display: "block" }} className="font-weight-light">
                  {creators.slice(0, 3).map((creator) => creator.name).join(", ")}
                  {creators.length > 3 ? ", et al." : null}
                </small>
              </div>
              : null
          }
          <div className="card-text text-rk-text mt-3 mb-2">
            {description ? description : null}
          </div>
          {tagList && tagList.length > 0 ?
            <Fragment>
              <div className="tagList mt-auto mb-2">
                <ProjectTagList tagList={tagList} />
              </div>
              <p className="card-text ">
                <TimeCaption caption={labelCaption || "Updated"} time={timeCaption} className="text-secondary"/>
              </p>
            </Fragment>
            : <p className="card-text mt-auto">
              <TimeCaption caption={labelCaption || "Updated"} time={timeCaption} className="text-secondary"/>
            </p>
          }
          {mediaContent ?
            <img src={mediaContent} alt=" " className="card-img-bottom"/>
            : null
          }
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
        <VisibilityIcon visibility={visibility} />
      </div>
    </div>
    <Col className="d-flex align-items-start flex-column col-10 overflow-hidden">
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
              {creators.slice(0, 3).map((creator) => creator.name).join(", ")}
              {creators.length > 3 ? ", et al." : null}
            </small>
          </div>
          : null
      }
      <div className="description text-truncate text-rk-text d-flex">
        {description}
      </div>
      {
        tagList ?
          <div className="tagList">
            <ProjectTagList tagList={tagList} />
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
