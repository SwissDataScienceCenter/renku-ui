import { Fragment, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button, Row, Col } from "reactstrap";

import { ACCESS_LEVELS } from "../../../api-client";
import LazyMarkdownTextExcerpt from "../../../components/markdown/LazyMarkdownTextExcerpt";
import { Loader } from "../../../components/Loader";
import ListDisplay from "../../../components/List";
import { ThrottledTooltip } from "../../../components/Tooltip";
import { getUpdatedDatasetImage } from "../../../dataset/DatasetFunctions";

import type { DatasetCore } from "../Project";

function datasetToDict(
  datasetsUrl: string,
  gridDisplay: boolean,
  dataset: DatasetCore
) {
  const timeCaption =
    dataset.created_at != null ? new Date(dataset.created_at) : "";
  return {
    id: dataset.slug,
    url: `${datasetsUrl}/${encodeURIComponent(dataset.slug)}/`,
    itemType: "dataset",
    title: dataset.name,
    slug: dataset.slug,
    tagList: dataset.keywords,
    description:
      dataset.description !== undefined && dataset.description !== null ? (
        <Fragment>
          <LazyMarkdownTextExcerpt
            markdownText={dataset.description}
            singleLine={gridDisplay ? false : true}
            charsLimit={gridDisplay ? 200 : 100}
          />
          <span className="ms-1">
            {dataset.description.includes("\n") ? " [...]" : ""}
          </span>
        </Fragment>
      ) : null,
    timeCaption: timeCaption,
    labelCaption: "Created ",
    creators: dataset.creators,
    imageUrl: getUpdatedDatasetImage(dataset?.mediaContent, timeCaption),
  };
}

type DatasetListProps = {
  datasets: DatasetCore[];
  datasetsUrl: string;
};

function DatasetList({ datasets, datasetsUrl }: DatasetListProps) {
  if (datasets == null) return <Loader />;

  const gridDisplay = true;
  const datasetItems = datasets.map((d) => {
    return datasetToDict(datasetsUrl, gridDisplay, d);
  });
  return (
    <ListDisplay
      itemsType="dataset"
      search={null}
      currentPage={null}
      gridDisplay={gridDisplay}
      totalItems={datasets.length}
      perPage={datasets.length}
      items={datasetItems}
    />
  );
}

type AddDatasetButtonProps = {
  accessLevel: number;
  locked: boolean;
  newDatasetUrl: string;
};

function AddDatasetButton({
  accessLevel,
  locked,
  newDatasetUrl,
}: AddDatasetButtonProps) {
  if (accessLevel < ACCESS_LEVELS.MAINTAINER) return null;
  if (locked) {
    return (
      <div id="add-dataset-button">
        <Button
          data-cy="add-dataset-button"
          className="btn-outline-rk-pink"
          disabled={true}
        >
          Add Dataset
        </Button>
        <ThrottledTooltip
          target="add-dataset-button"
          tooltip="Cannot add dataset until project modification finishes."
        />
      </div>
    );
  }

  return (
    <div>
      <Link
        className="btn btn-outline-rk-pink"
        role="button"
        to={newDatasetUrl}
      >
        Add Dataset
      </Link>
    </div>
  );
}

type DatasetsListViewProps = {
  accessLevel: number;
  datasets: DatasetCore[];
  datasetsUrl: string;
  locked: boolean;
  newDatasetUrl: string;
};

export default function DatasetsListView(props: DatasetsListViewProps) {
  const datasets = useMemo(
    () =>
      props.datasets.sort((d1, d2) =>
        d1.name > d2.name ? 1 : d2.name > d1.name ? -1 : 0
      ),
    [props.datasets]
  );

  return (
    <>
      <Row key="header" className="pt-2 pb-3">
        <Col className="d-flex mb-2 justify-content-between">
          <h3 className="me-4">Datasets List</h3>
          <AddDatasetButton
            accessLevel={props.accessLevel}
            locked={props.locked}
            newDatasetUrl={props.newDatasetUrl}
          />
        </Col>
      </Row>
      <Row key="datasetsList">
        <Col xs={12}>
          <DatasetList datasets={datasets} datasetsUrl={props.datasetsUrl} />
        </Col>
      </Row>
    </>
  );
}
