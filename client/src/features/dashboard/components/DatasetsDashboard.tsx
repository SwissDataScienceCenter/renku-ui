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
import { Fragment } from "react";
import { Search } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { SortingOptions } from "../../../components/sortingEntities/SortingEntities";
import {
  SearchEntitiesQueryParams,
  useSearchEntitiesQuery,
} from "../../kgSearch/KgSearchApi";

import cx from "classnames";
import ListDisplay from "../../../components/List";
import { Loader } from "../../../components/Loader";
import SearchEntityIcon from "../../../components/icons/SearchEntityIcon";
import { mapSearchResultToEntity } from "../../../utils/helpers/KgSearchFunctions";
import { Url } from "../../../utils/helpers/url";
import { stateToSearchString } from "../../kgSearch/KgSearchState";

interface OtherDatasetsButtonProps {
  totalDatasets: number;
}
function OtherDatasetsButton({ totalDatasets }: OtherDatasetsButtonProps) {
  const projectFilters = { type: { project: false, dataset: true } };
  const paramsUrlStrMyDatasets = stateToSearchString({
    ...projectFilters,
    // author: "user" as KgAuthor,
    role: { owner: true, maintainer: false, reader: false },
  });
  const paramsUrlStrExploreDatasets = stateToSearchString({
    ...projectFilters,
    // author: "all" as KgAuthor,
  });
  return totalDatasets > MAX_DATASETS_TO_SHOW ? (
    <div className="d-flex justify-content-center">
      <Link
        to={`${Url.get(Url.pages.searchEntities)}?${paramsUrlStrMyDatasets}`}
        data-cy="view-my-datasets-btn"
        className={cx(
          "btn",
          "btn-outline-rk-pink",
          "d-flex",
          "align-items-center"
        )}
      >
        <SearchEntityIcon className="me-2" width={20} height={22} />
        View all my Datasets
      </Link>
    </div>
  ) : (
    <div className="d-flex justify-content-center">
      <Link
        to={`${Url.get(
          Url.pages.searchEntities
        )}?${paramsUrlStrExploreDatasets}`}
        data-cy="explore-other-datasets-btn"
        className={cx(
          "btn",
          "btn-outline-rk-pink",
          "d-flex",
          "align-items-center"
        )}
      >
        <Search className="me-2" size={20} />
        Explore other Datasets
      </Link>
    </div>
  );
}

interface DatasetListProps {
  datasets: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  gridDisplay: boolean;
}
function DatasetListRows({ datasets, gridDisplay }: DatasetListProps) {
  const items = datasets.map((dataset) => mapSearchResultToEntity(dataset));

  return (
    <Fragment>
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
          500: 1,
        }}
      />
    </Fragment>
  );
}

const MAX_DATASETS_TO_SHOW = 3;
function DatasetDashboard() {
  const searchRequest: SearchEntitiesQueryParams = {
    phrase: "",
    sort: SortingOptions.DescDate,
    page: 1,
    perPage: 3,
    // author: "user",
    type: {
      project: false,
      dataset: true,
    },
    role: { owner: true, maintainer: false, reader: false },
    // userName,
  };
  const { data, isFetching, isLoading, error } =
    useSearchEntitiesQuery(searchRequest);
  const totalUserDatasets =
    isFetching || isLoading || !data || error ? undefined : data.total;
  let datasetsToShow;
  if (isFetching || isLoading) {
    datasetsToShow = <Loader />;
  } else if (error || !data) {
    datasetsToShow = null;
  } else {
    datasetsToShow =
      data.total > 0 ? (
        <DatasetListRows datasets={data.results} gridDisplay={false} />
      ) : (
        <p className="rk-dashboard-section-header">You have no datasets</p>
      );
  }
  const otherDatasetBtn =
    totalUserDatasets === undefined ? null : (
      <OtherDatasetsButton totalDatasets={totalUserDatasets} />
    );
  return (
    <>
      <div className="rk-dashboard-dataset" data-cy="dataset-container">
        <div className="rk-dashboard-section-header d-flex justify-content-between align-items-center flex-wrap">
          <h3 className="rk-dashboard-title" key="project-header">
            Datasets
          </h3>
        </div>
        {datasetsToShow}
        {otherDatasetBtn}
      </div>
    </>
  );
}

export { DatasetDashboard };
