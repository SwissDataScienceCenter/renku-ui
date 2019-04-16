import React, { Component } from 'react';
import { Link}  from 'react-router-dom';

import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faFolderClosed from '@fortawesome/fontawesome-free-solid/faFolder'
import faFolderOpen from '@fortawesome/fontawesome-free-solid/faFolderOpen'
import faFile from '@fortawesome/fontawesome-free-solid/faFile'
import './treeviewstyle.css';


class TreeNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSelected:false,
      childrenOpen: this.props.childrenOpen
    }
    this.handleIconClick = this.handleIconClick.bind(this);
  }

  handleIconClick(e) {
    this.props.setOpenFolder(this.props.path);
    this.setState((prevState) => ({ childrenOpen: !prevState.childrenOpen }));
  }

  render() {
    const icon = this.props.node.children.length ?
      (this.state.childrenOpen === false ? 
        <FontAwesomeIcon className="icon-purple" icon={faFolderClosed}  /> 
        : <FontAwesomeIcon className="icon-purple" icon={faFolderOpen}  />)
      : <FontAwesomeIcon className="icon-grey" icon={faFile} />

    const order = this.props.node.children.length ? "order-seccond" : "order-third";
    const hidden = this.props.node.name.startsWith(".") ? " hidden-folder " : "";

    const children = this.props.node.children ?
      this.props.node.children.map((node, index) => {
        return <TreeNode 
          path={node.path} 
          key={node.path} 
          node={node}
          childrenOpen={this.props.hash[node.path].childrenOpen}
          projectUrl={this.props.projectUrl}
          lineageUrl={this.props.lineageUrl}
          setOpenFolder={this.props.setOpenFolder}
          hash={this.props.hash} 
        />
      })
      : null;

    let elementToRender;
    if(this.props.node.jsonObj !== null){
      elementToRender = 
        <div className={order+" "+hidden}>
          <Link to= {`${this.props.projectUrl}/${this.props.node.jsonObj.path}`} >
            <div className={"fs-element"}>
              {icon} {this.props.node.name} 
            </div>
          </Link>
        </div>
      ;
    } else {
      elementToRender = this.state.childrenOpen ? 
        <div className={order+" "+hidden} >
          <div className={"fs-element"} onClick={this.handleIconClick} >
            {icon} {this.props.node.name}
          </div>
          <div className="pl-3">
            {children}
          </div> 
        </div> 
        : 
        <div className={order+" "+hidden} > 
          <div className={"fs-element"} onClick={this.handleIconClick}>
            {icon} {this.props.node.name}
          </div>
        </div>;
    }   
      
    return elementToRender;
  }
}

class FilesTreeView extends Component {
  
  constructor(props){
    super(props);
    this.state = {
      tree : props.data ?
        props.data.tree.map((node, index) => {
          return <TreeNode
            key={node.path} 
            node={node} 
            childrenOpen={this.props.hash[node.path].childrenOpen}
            projectUrl={this.props.projectUrl}
            lineageUrl={this.props.lineageUrl}
            setOpenFolder={this.props.setOpenFolder}
            path={node.path}
            hash={this.props.data.hash} />
        })
        :
        null
    }
  }

  render() {

    return (
      <div className="tree-container">
        <div className="tree-title">
          <span>Repository</span>
        </div>
        {this.state.tree}
      </div>
    );
  }

} export default FilesTreeView;