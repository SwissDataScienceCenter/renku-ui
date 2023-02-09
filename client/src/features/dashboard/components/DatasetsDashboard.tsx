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
import { SearchEntitiesQueryParams, useSearchEntitiesQuery } from "../../kgSearch/KgSearchApi";
import { SortingOptions } from "../../../utils/components/sortingEntities/SortingEntities";
import React, { Fragment } from "react";
import { useHistory } from "react-router-dom";
import ListDisplay from "../../../utils/components/List";
import { Loader } from "../../../utils/components/Loader";
import { KgAuthor } from "../../kgSearch/KgSearch";
import { Button } from "../../../utils/ts-wrappers";
import { mapSearchResultToEntity } from "../../../utils/helpers/KgSearchFunctions";
import {
  kgSearchInitialState,
  stateToSearchString
} from "../../kgSearch/KgSearchState";
import { Url } from "../../../utils/helpers/url";


interface OtherDatasetsButtonProps {
  totalDatasets: number;
}
function OtherDatasetsButton({ totalDatasets }: OtherDatasetsButtonProps) {
  const history = useHistory();
  const handleOnClick = (e: React.MouseEvent<HTMLElement>, author: KgAuthor) => {
    e.preventDefault();
    const newState = { ...kgSearchInitialState,
      type: { project: false, dataset: true }, author };
    const paramsUrlStr = stateToSearchString(newState);
    history.push(`${Url.get(Url.pages.searchEntities)}?${paramsUrlStr}`);
  };
  return totalDatasets > MAX_DATASETS_TO_SHOW ?
    (
      <div className="d-flex justify-content-center">
        <Button data-cy="view-my-datasets-btn" className="btn btn-outline-rk-pink"
          onClick={(e: React.MouseEvent<HTMLElement>) => handleOnClick(e, "user")}>
          <div className="d-flex gap-2 text-rk-pink">
            <img src="/frame-pink.svg" className="rk-icon rk-icon-md" />View all my Datasets</div>
        </Button></div>
    ) :
    (<div className="d-flex justify-content-center">
      <Button data-cy="explore-other-datasets-btn" className="btn btn-outline-rk-pink"
        onClick={(e: React.MouseEvent<HTMLElement>) => handleOnClick(e, "all")}>
        <div className="d-flex gap-2 text-rk-pink">
          <img src="/explore-pink.svg" className="rk-icon rk-icon-md" />Explore other Datasets</div>
      </Button></div>);
}

interface DatasetListProps {
  datasets: any [];
  gridDisplay: boolean;
}
function DatasetListRows({ datasets, gridDisplay }: DatasetListProps) {
  const items = datasets.map(dataset => mapSearchResultToEntity(dataset));

  return <Fragment>
    <ListDisplay
      key="list-datasets"
      itemsType="dataset"
      search={null}
      currentPage={null}
      gridDisplay={gridDisplay}
      totalItems={items.length}
      perPage={items.length}
      items={items}
      gridColumnsBreakPoint={{
        default: 2,
        1100: 2,
        700: 2,
        500: 1
      }}
    />
  </Fragment>;
}

const MAX_DATASETS_TO_SHOW = 3;
interface DatasetDashboardProps {
  userName: string;
}
function DatasetDashboard({ userName }: DatasetDashboardProps) {
  const searchRequest: SearchEntitiesQueryParams = {
    phrase: "",
    sort: SortingOptions.DescDate,
    page: 1,
    perPage: 3,
    author: "user",
    type: {
      project: false,
      dataset: true,
    },
    userName
  };
  const { data, isFetching, isLoading, error } = useSearchEntitiesQuery(searchRequest);
  const totalUserDatasets = isFetching || isLoading || !data || error ? undefined : data.total;
  let datasetsToShow;
  if (isFetching || isLoading) {
    datasetsToShow = <Loader />;
  }
  else if (error || !data) {
    datasetsToShow = null;
  }
  else {
    datasetsToShow = data.total > 0 ?
      <DatasetListRows datasets={data.results} gridDisplay={false} />
      : <p className="rk-dashboard-section-header">You have no datasets</p>;
  }
  const otherDatasetBtn = totalUserDatasets === undefined ? null :
    <OtherDatasetsButton totalDatasets={totalUserDatasets} />;
  return (
    <>
      <div className="rk-dashboard-dataset" data-cy="dataset-container">
        <div className="rk-dashboard-section-header d-flex justify-content-between align-items-center flex-wrap">
          <h3 className="rk-dashboard-title" key="project-header">Datasets</h3>
        </div>
        {datasetsToShow}
        {otherDatasetBtn}
      </div>
    </>
  );

}

export { DatasetDashboard };
