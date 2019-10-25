import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTable } from '@fortawesome/free-solid-svg-icons';

import '../filestreeview/treeviewstyle.css';
import { Loader } from '../../utils/UIComponents';

function DatasetListRow(props){
  const dataset = props.dataset;
  return <NavLink
    activeClassName="selected-dataset"
    key={dataset.identifier}
    to={`${props.datasetsUrl}/${encodeURIComponent(dataset.identifier)}/`}
  >
    <div className={"fs-element"}>
      <FontAwesomeIcon className="icon-grey" icon={faTable} /> {dataset.name}
    </div>
  </NavLink>
}

export default function DatasetsListView(props){
  const [datasets, setDatasets] = useState(undefined);

  useState(()=>{
    if(datasets === undefined && props.datasets !== undefined)
      setDatasets(props.datasets);
  })

  return(
    <div className="tree-container">
      <div className="tree-title">
        <span className="tree-header-title text-truncate">
          Datasets List
        </span>
      </div>
      <nav>
        {
          datasets !== undefined ?
            datasets.map((dataset)=>
              <DatasetListRow
                key={"dataset-"+dataset.identifier}
                dataset={dataset}
                datasetsUrl={props.datasetsUrl} />
            )
            : <Loader />
        }
      </nav>
    </div>
  )

}
