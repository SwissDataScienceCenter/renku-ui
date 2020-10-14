import React, { Component } from "react";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faFolder as faFolderClosed, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { faProjectDiagram } from "@fortawesome/free-solid-svg-icons";

import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import "./treeviewstyle.css";


class TreeNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSelected: this.props.nodeInsideisSelected,
      childrenOpen: this.props.childrenOpen
    };
    this.handleIconClick = this.handleIconClick.bind(this);
  }

  handleIconClick() {
    this.props.setOpenFolder(this.props.path);
    this.setState((prevState) => ({ childrenOpen: !prevState.childrenOpen }));
    setTimeout(() => this.props.updateTreeMaxHeight(), 10);
    setTimeout(() => this.props.updateTreeMaxHeight(), 1000);
  }

  componentDidUpdate(previousProps) {
    if (previousProps.childrenOpen !== this.props.childrenOpen)
      this.setState({ childrenOpen: this.props.childrenOpen });

  }

  render() {
    const icon = this.props.node.type === "tree" ?
      (this.state.childrenOpen === false ?
        <FontAwesomeIcon className="icon-purple" icon={faFolderClosed} />
        : <FontAwesomeIcon className="icon-purple" icon={faFolderOpen} />)
      : <FontAwesomeIcon className="icon-grey" icon={faFile} />;

    const order = this.props.node.type === "tree" ? "order-seccond" : "order-third";
    const hidden = this.props.node.name.startsWith(".") ? " hidden-folder " : "";

    const children = this.props.node.children ?
      this.props.node.children.map((node) => {
        return <TreeNode
          path={node.path}
          key={node.path}
          node={node}
          childrenOpen={this.props.hash[node.path].childrenOpen}
          projectUrl={this.props.projectUrl}
          lineageUrl={this.props.lineageUrl}
          setOpenFolder={this.props.setOpenFolder}
          hash={this.props.hash}
          fileView={this.props.fileView}
          isLfs={this.props.hash[node.path].isLfs}
          nodeInsideIsSelected={this.props.currentUrl.endsWith(node.path)}
          currentUrl={this.props.currentUrl}
        />;
      })
      : null;

    let elementToRender;
    let selected = this.props.nodeInsideIsSelected ? " selected-file " : "";


    if (this.props.node.type === "blob" || this.props.node.type === "commit") {
      elementToRender =
        <div className={order + " " + hidden + " " + selected}>
          <div className={"fs-element"} >
            { this.props.fileView ?
              <Link to= {`${this.props.projectUrl}/${this.props.node.jsonObj.path}`} >
                <div className={"fs-element"}>
                  {icon} {this.props.node.name}
                </div>
              </Link>
              :
              <Link to= {`${this.props.lineageUrl}/${this.props.node.jsonObj.path}`} >
                <div className={"fs-element"}>
                  {icon} {this.props.node.name}
                </div>
              </Link>
            }
          </div>
        </div>
      ;
    }
    else {
      const childrenOpen = this.state.childrenOpen ? <div className="pl-3">{children}</div> : null;
      elementToRender =
        <div className={order + " " + hidden} >
          <div className={"fs-element"} onClick={this.handleIconClick} >
            {icon} {this.props.node.name}
          </div>
          {childrenOpen}
        </div>;
    }

    return elementToRender;
  }
}

class FilesTreeView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      dropdownOpen: false,
      treeStructure: this.props.data,
    };
    this.toggle = this.toggle.bind(this);
  }

  componentDidMount() {
    this.updateTreeMaxHeight();
    if (!this.state.listener) {
      const listener = () => this.updateTreeMaxHeight();
      this.setState({ listener });
      window.addEventListener("resize", listener);
    }
  }

  componentWillUnmount() {
    if (this.state.listener)
      window.removeEventListener("resize", this.state.listener);
  }

  updateTreeMaxHeight() {
    const maxHeight = this.computeTreeMaxHeight();
    this.setState({ maxHeight });
  }

  computeTreeMaxHeight() {
    // return when the width is <MD
    if (window.innerWidth <= 768)
      return null;

    // check if current nav is already limited in size
    const navContainer = document.getElementById("project-files-nav-container");
    const limited = navContainer && navContainer.scrollHeight !== navContainer.offsetHeight ?
      true :
      false;

    // return when the whole content doesn't overflow the window element
    const heightHtml = [...document.getElementsByTagName("html")]
      .reduce((height, elem) => height + elem.offsetHeight, 0);
    if (!limited && heightHtml <= window.innerHeight)
      return null;

    // return when the file nav doesn't take more space than file content
    const heightProjectFilesNav = document.getElementById("project-files-nav") ?
      [...document.getElementById("project-files-nav").childNodes]
        .reduce((height, elem) => height + elem.offsetHeight, 0) :
      0;
    const heightProjectFilesContent = document.getElementById("project-files-content") ?
      [...document.getElementById("project-files-content").childNodes]
        .reduce((height, elem) => height + elem.offsetHeight, 0) : 0;
    if (heightProjectFilesNav <= heightProjectFilesContent)
      return null;

    // compute the available space for file content
    const heightHeader = [...document.getElementsByTagName("header")]
      .reduce((height, elem) => height + elem.offsetHeight, 0);
    const heightFooter = [...document.getElementsByTagName("footer")]
      .reduce((height, elem) => height + elem.offsetHeight, 0);
    const heightBlankSpaces = [...document.getElementsByClassName("blank-space")]
      .reduce((height, elem) => height + elem.offsetHeight, 0);
    const heightProjectHeader = document.getElementById("project-header") ?
      document.getElementById("project-header").offsetHeight :
      0;
    const heightProjectNav = document.getElementById("project-header") ?
      document.getElementById("project-header").offsetHeight :
      0;
    const heightElements = heightHeader + heightFooter + heightBlankSpaces + heightProjectHeader + heightProjectNav;
    const heightMax = window.innerHeight - heightElements;
    return heightMax;
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  render() {
    const fileView = !this.props.currentUrl.startsWith(this.props.lineageUrl);

    const emptyView = this.props.projectUrl.startsWith(this.props.currentUrl)
      || this.props.lineageUrl.startsWith(this.props.currentUrl);

    let redirectURL = "";
    if (!emptyView) {
      redirectURL = fileView ?
        this.props.currentUrl.replace(this.props.projectUrl, "")
        : this.props.currentUrl.replace(this.props.lineageUrl, "");
    }

    let style = {};
    if (this.state.maxHeight)
      style.maxHeight = this.state.maxHeight;

    const tree = this.state.treeStructure.tree ?
      this.state.treeStructure.tree.map((node) => {
        return <TreeNode
          key={node.path}
          node={node}
          childrenOpen={this.state.treeStructure.hash[node.path].childrenOpen}
          projectUrl={this.props.projectUrl}
          lineageUrl={this.props.lineageUrl}
          setOpenFolder={this.props.setOpenFolder}
          path={node.path}
          hash={this.props.data.hash}
          fileView={fileView}
          isLfs={this.state.treeStructure.hash[node.path].isLfs}
          nodeInsideIsSelected={this.props.currentUrl.endsWith(node.path)}
          currentUrl={this.props.currentUrl}
          updateTreeMaxHeight={() => this.updateTreeMaxHeight()}
        />;
      })
      :
      null;

    const toFile = emptyView ? this.props.projectUrl.replace("/blob", "") + redirectURL
      : this.props.projectUrl + redirectURL;
    const toLineage = this.props.lineageUrl + redirectURL;

    return (
      <div id="project-files-nav-container" style={style} className="tree-container overflow-auto">
        <div className="tree-title">
          <span className="tree-header-title text-truncate">
            {fileView ? "File View" : "Lineage View"}
          </span>
          <span className="float-right throw-right-in-flex">
            <Dropdown color="primary" size="sm" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
              <DropdownToggle caret size="sm" color="primary">
                { fileView ?
                  <FontAwesomeIcon className="icon-white" icon={faFile} />
                  : <FontAwesomeIcon className="icon-white" icon={faProjectDiagram} />
                }
              </DropdownToggle>
              <DropdownMenu>
                { fileView ?
                  <Link to={toLineage}><DropdownItem> Lineage View </DropdownItem></Link>
                  : <Link to={toFile}><DropdownItem>File View</DropdownItem></Link>
                }
              </DropdownMenu>
            </Dropdown>
          </span>
        </div>
        {tree}
      </div>
    );
  }

} export default FilesTreeView;
