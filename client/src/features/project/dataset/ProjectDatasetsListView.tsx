import React, { Fragment, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button, Row, Col } from "reactstrap";

import { ACCESS_LEVELS } from "../../../api-client";
import { SpecialPropVal } from "../../../model";
import { MarkdownTextExcerpt } from "../../../components/markdown/RenkuMarkdown";
import { Loader } from "../../../components/Loader";
import ListDisplay from "../../../components/List";
import { ThrottledTooltip } from "../../../components/Tooltip";
import { getUpdatedDatasetImage } from "../../../dataset/DatasetFunctions";

import type { DatasetCore, DatasetKg } from "../Project";

function datasetToDict(
  datasetsUrl: string,
  dataset_kg: DatasetKg | undefined,
  graphStatus: boolean,
  gridDisplay: boolean,
  dataset: DatasetCore
) {
  const kgCaption =
    dataset_kg !== undefined && graphStatus === true ? "In the Knowledge Graph" : "Not in the Knowledge Graph";
  const timeCaption = dataset.created_at != null ? new Date(dataset.created_at) : "";
  return {
    id: dataset.name,
    url: `${datasetsUrl}/${encodeURIComponent(dataset.name)}/`,
    itemType: "dataset",
    title: dataset.title || dataset.name,
    tagList: dataset.keywords,
    description:
      dataset.description !== undefined && dataset.description !== null ? (
        <Fragment>
          <MarkdownTextExcerpt
            markdownText={dataset.description}
            singleLine={gridDisplay ? false : true}
            charsLimit={gridDisplay ? 200 : 100}
          />
          <span className="ms-1">{dataset.description.includes("\n") ? " [...]" : ""}</span>
        </Fragment>
      ) : null,
    timeCaption: timeCaption,
    labelCaption: `${kgCaption}. Created `,
    creators: dataset.creators,
    imageUrl: getUpdatedDatasetImage(dataset?.mediaContent, timeCaption),
  };
}

type DatasetListProps = {
  datasets: DatasetCore[];
  datasets_kg: DatasetKg[];
  datasetsUrl: string;
  graphStatus: boolean;
};

function DatasetList({ datasets, datasets_kg, datasetsUrl, graphStatus }: DatasetListProps) {
  if (datasets == null) return <Loader />;

  const gridDisplay = true;
  const datasetItems = datasets.map((d) => {
    const dataset_kg = datasets_kg ? datasets_kg.find((dataset_kg) => dataset_kg.name === d.name) : undefined;
    return datasetToDict(datasetsUrl, dataset_kg, graphStatus, gridDisplay, d);
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

function AddDatasetButton({ accessLevel, locked, newDatasetUrl }: AddDatasetButtonProps) {
  if (accessLevel < ACCESS_LEVELS.MAINTAINER) return null;
  if (locked) {
    return (
      <div id="add-dataset-button">
        <Button data-cy="add-dataset-button" className="btn-outline-rk-pink" disabled={true}>
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
      <Link className="btn btn-outline-rk-pink" role="button" to={newDatasetUrl}>
        Add Dataset
      </Link>
    </div>
  );
}

type DatasetsListViewProps = {
  accessLevel: number;
  datasets: DatasetCore[];
  datasets_kg: DatasetKg[] | string;
  datasetsUrl: string;
  graphStatus: boolean;
  locked: boolean;
  newDatasetUrl: string;
};

export default function DatasetsListView(props: DatasetsListViewProps) {
  const datasets = useMemo(() => props.datasets, [props.datasets]);

  if (props.datasets_kg === SpecialPropVal.UPDATING) return <Loader />;
  if (typeof props.datasets_kg === "string") return <Loader />;

  const datasets_kg = props.datasets_kg;

  return (
    <>
      <Row key="header" className="pt-2 pb-3">
        <Col className="d-flex mb-2 justify-content-between">
          <h3 className="me-4">Datasets List</h3>
          <AddDatasetButton accessLevel={props.accessLevel} locked={props.locked} newDatasetUrl={props.newDatasetUrl} />
        </Col>
      </Row>
      <Row key="datasetsList">
        <Col xs={12}>
          <DatasetList
            datasets={datasets}
            datasets_kg={datasets_kg}
            datasetsUrl={props.datasetsUrl}
            graphStatus={props.graphStatus}
          />
        </Col>
      </Row>
    </>
  );
}
