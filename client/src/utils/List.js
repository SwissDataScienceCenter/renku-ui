import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { Col } from "reactstrap";
import { Pagination, TimeCaption } from "./UIComponents";
import Masonry from "react-masonry-css";
import { ProjectTagList } from "../project/shared/ProjectTag.container";


function ListCard(props) {
  const { url, color, title, description, tagList, timeCaption, labelCaption, mediaContent, creators } = props;

  return (
    <div className="col text-decoration-none p-2 rk-search-result-card">
      <Link to={url} className="col text-decoration-none">
        <div className="card card-body border-0">
          <span className={"circle me-3 mt-2 mb-2 " + color}> </span>
          <div className="title lh-sm">
            {title}
          </div>
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

  const { url, color, title, description, tagList, timeCaption, labelCaption, mediaContent, creators } = props;

  return <Link className="d-flex flex-row rk-search-result" to={url}>
    <span className={"circle me-3 mt-2 " + color}></span>
    <Col className="d-flex align-items-start flex-column col-10 overflow-hidden">
      <div className="title d-inline-block text-truncate">
        {title}
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

function ListDisplay(props) {

  const { currentPage, perPage, items, search, totalItems, gridDisplay, itemsType } = props;

  if (!items || !items.length)
    return (<p>We could not find any matching {itemsType}s.</p>);

  const colorsArray = ["green", "pink", "yellow"];

  const rows = gridDisplay ?
    items.map(item => <ListCard key={item.id} {...item} color={colorsArray[item.stringScore]}/>)
    : items.map(item => <ListBar key={item.id} {...item} color={colorsArray[item.stringScore]}/>);

  const onPageChange = (page) => { search({ page }); };

  return gridDisplay ?
    <div>
      <Masonry
        className="rk-search-result-grid mb-4"
        breakpointCols={{
          default: 4,
          1100: 3,
          700: 2,
          500: 1
        }}
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
