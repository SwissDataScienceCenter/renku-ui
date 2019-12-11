import React, { useState } from 'react';
import { NavLink,  Link } from 'react-router-dom';
import { ACCESS_LEVELS } from '../../api-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTable, faPlus } from '@fortawesome/free-solid-svg-icons';

import '../filestreeview/treeviewstyle.css';
import { Loader } from '../../utils/UIComponents';
import { UncontrolledButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

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

function CreateDatasetButton(props){
  if(props.visibility.accessLevel >= ACCESS_LEVELS.MAINTAINER)
    return <span className="float-right throw-right-in-flex">
      <UncontrolledButtonDropdown size="sm">
        <DropdownToggle color="primary" className="alternateToggleStyle" caret>
          <FontAwesomeIcon icon={faPlus} style={{ color: 'white', backgroundColor: "#5561A6" }} />
        </DropdownToggle>
        <DropdownMenu right={false}>
          <DropdownItem>
            <Link to={props.newDatasetUrl}>New Dataset</Link>
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledButtonDropdown>
    </span>;
  else return null;
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
        <CreateDatasetButton visibility={props.visibility} newDatasetUrl={props.newDatasetUrl}/>
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
