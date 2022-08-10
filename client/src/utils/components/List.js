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

import React, { useContext, useRef } from "react";
import { Link, useHistory } from "react-router-dom";
import { Col } from "reactstrap";
import Masonry from "react-masonry-css";
import { Briefcase, HddStack, Globe, People, Lock } from "react-bootstrap-icons";
import { faPlay } from "@fortawesome/free-solid-svg-icons";

import { TimeCaption } from "./TimeCaption";
import { Pagination } from "./Pagination";
import { ThrottledTooltip } from "./Tooltip";
import AppContext from "../context/appContext";
import { CardButton } from "./buttons/Button";

const VisibilityIcon = ({ visibility, className }) => {
  const ref = useRef(null);
  const { client } = useContext(AppContext);
  if (!visibility) return null;
  const icon = {
    public: <Globe />,
    private: <Lock />,
    internal: <People />
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
    top: "-3px",
  };

  return <>
    <span ref={ref} className={`card-visibility-icon ${className}`} style={style}>
      { icon[visibility] || "" }
    </span>
    <ThrottledTooltip
      target={ref}
      tooltip={tooltip[visibility]} />
  </>;
};

function Slug({ display, slug }) {
  if (!slug) return null;
  if (display === "list") {
    return <div className="card-text text-truncate creators text-rk-text-light">
      {slug}
    </div>;
  }

  return <span className="slug font-weight-light text-rk-text ms-2">
    {slug}
  </span>;
}

function Creators({ display, creators }) {
  if (!creators) return null;
  if (display === "list") {
    return <div className="card-text creators text-truncate text-rk-text-light">
      {creators.slice(0, 3).map((creator) => creator.name).join(", ")}
      {creators.length > 3 ? ", et al." : null}
    </div>;
  }

  return <div className="creators text-truncate text-rk-text">
    <small style={{ display: "block" }} className="font-weight-light">
      {creators.slice(0, 3).map((creator) => creator.name).join(", ")}
      {creators.length > 3 ? ", et al." : null}
    </small>
  </div>;
}


function EntityLabel({ type }) {
  switch (type) {
    case "project":
      return (
        <div className="card-type-label text-rk-green gap-2 d-flex align-items-center">
          <Briefcase/>
          Project
        </div>);
    case "dataset":
      return (
        <div className="card-type-label text-rk-pink gap-2 d-flex align-items-center">
          <HddStack />
          Dataset
        </div>
      );
    default:
      return null;
  }
}

function EntityButton({ type, slug }) {
  const history = useHistory();
  const carButtonRef = useRef(null);
  let handleClick;

  switch (type) {
    case "project":
      handleClick = (e) => {
        e.preventDefault();
        history.push(`/projects/${slug}/sessions/new?autostart=1`);
      };
      return (
        <>
          <div ref={carButtonRef} className="card-button">
            <CardButton color="rk-green" icon={faPlay} handleClick={handleClick} />
          </div>
          <ThrottledTooltip
            target={carButtonRef}
            tooltip="Start a session of this project" />
        </>
      );
    case "dataset":
      return null; // no defined yet
    default:
      return null;
  }
}

function EntityDescription({ description }) {
  const descriptionStyles = {
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",// eslint-disable-line
    lineClamp: 3,
    WebkitLineClamp: 3,// eslint-disable-line
    WebkitBoxOrient: "vertical",// eslint-disable-line
    margin: "12px 0",
    minHeight: "75px",
    height: "75px",
  };

  return (<div className="card-text text-rk-text-light" style={descriptionStyles}>
    {description ? description : null}
  </div>);
}

function EntityTags ({ tagList, itemType }) {
  const colorText = itemType === "project" ? "text-rk-green" : "text-rk-pink";

  return (
    <div className={`tagList card-tags text-truncate ${colorText}`}>
      {tagList?.map(tag => `#${tag}`).join(" ")}
    </div>
  );
}

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
    labelCaption, creators, itemType, slug, visibility } = props;

  return (
    <div data-cy="list-card" className="col text-decoration-none p-2 rk-search-result-card">
      <Link to={url} className="col text-decoration-none">
        <div className="card card-entity">
          <div className={`card-header-entity card-header-entity--${itemType}`}>
            <div className="d-flex justify-content-between align-items-center m-3">
              <EntityLabel type={itemType} />
              <VisibilityIcon visibility={visibility} />
            </div>
            <div className="card-bg-title">{title}</div>
          </div>
          <EntityButton type={itemType} slug={slug} />
          <div className="card-body">
            <div className="card-title text-truncate lh-sm" data-cy="list-card-title">
              {title}
            </div>
            <Slug display="list" slug={slug} />
            <Creators display="list" creators={creators} />
            <EntityDescription description={description} />
            <EntityTags tagList={tagList} itemType={itemType} />
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
        <Slug display="bar" slug={slug} />
      </div>
      <Creators display="bar" creators={creators} />
      <div className="description card-description text-truncate text-rk-text d-flex">
        {description}
      </div>
      <EntityTags tagList={tagList} itemType={itemType} />
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
