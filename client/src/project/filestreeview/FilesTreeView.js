import React, { Component } from "react";
import { Link } from "react-router-dom";
import { StickyContainer, Sticky } from "react-sticky";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faFolder as faFolderClosed, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { Button, ButtonGroup } from "reactstrap";
import "./treeviewstyle.css";


class TreeNode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSelected: this.props.nodeInsideIsSelected,
      childrenOpen: this.props.childrenOpen
    };
    this.handleIconClick = this.handleIconClick.bind(this);
    this.handleFileClick = this.handleFileClick.bind(this);
  }

  handleFileClick() {
    const treeElem = document.getElementById("tree-content");
    if (treeElem) {
      this.props.savePosition({
        path: this.props.node.path,
        scrollTop: treeElem.scrollTop
      });
    }
  }

  handleIconClick() {
    this.props.setOpenFolder(this.props.path);
    this.setState((prevState) => ({ childrenOpen: !prevState.childrenOpen }));
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
      : <FontAwesomeIcon className="icon-gray" icon={faFile} />;

    const order = this.props.node.type === "tree" ? "order-second" : "order-third";
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
          savePosition={this.props.savePosition}
        />;
      })
      : null;

    let elementToRender;
    let selected = this.props.nodeInsideIsSelected ? " selected-file " : "";

    if (this.props.node.type === "blob" || this.props.node.type === "commit") {
      elementToRender =
        <div className={order + " " + hidden + " " + selected}>
          <div className={"fs-element"} onClick={this.handleFileClick}>
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

class TreeContainer extends Component {
  render() {
    const { style, fileView, toLineage, toFile, tree } = this.props;

    const switchPage = () => {
      if (fileView)
        this.props.history.push(toLineage);
      else
        this.props.history.push(toFile);
    };

    return (
      <div className="tree-container" style={style}>
        <ButtonGroup className={"pb-1"}>
          <Button color="primary" outline onClick={switchPage} active={fileView}>
            File View
          </Button>
          <Button color="primary" outline onClick={switchPage} active={!fileView}>
            Lineage View
          </Button>
        </ButtonGroup>
        <div id="tree-content" className="tree-content mb-2 mb-md-0">
          {tree}
        </div>
      </div>
    );
  }
}

class FilesTreeView extends Component {
  savePosition(data) {
    if (!this.props.limitHeight)
      return;
    this.props.setLastNode(data);
  }

  render() {
    const fileView = !this.props.currentUrl.startsWith(this.props.lineageUrl);
    const treeStructure = this.props.data;
    const emptyView =
      this.props.projectUrl.startsWith(this.props.currentUrl) ||
      this.props.lineageUrl.startsWith(this.props.currentUrl);
    let redirectURL = "";
    if (!emptyView) {
      redirectURL = fileView ?
        this.props.currentUrl.replace(this.props.projectUrl, "") :
        this.props.currentUrl.replace(this.props.lineageUrl, "");
    }
    const toFile = emptyView ?
      this.props.projectUrl.replace("/blob", "") + redirectURL :
      this.props.projectUrl + redirectURL;
    const toLineage = this.props.lineageUrl + redirectURL;

    const tree = treeStructure.tree ?
      treeStructure.tree.map((node) => {
        return <TreeNode
          key={node.path}
          node={node}
          childrenOpen={treeStructure.hash[node.path].childrenOpen}
          projectUrl={this.props.projectUrl}
          lineageUrl={this.props.lineageUrl}
          setOpenFolder={this.props.setOpenFolder}
          path={node.path}
          hash={this.props.data.hash}
          fileView={fileView}
          isLfs={treeStructure.hash[node.path].isLfs}
          nodeInsideIsSelected={this.props.currentUrl.endsWith(node.path)}
          currentUrl={this.props.currentUrl}
          savePosition={this.savePosition.bind(this)}
        />;
      }) :
      null;

    const { limitHeight } = this.props;
    const treeProps = { fileView, toLineage, toFile, tree };

    // return the plain component if there is no need to limit the height
    if (!limitHeight)
      return (<TreeContainer history={this.props.history} {...treeProps} style={{}} />);

    // on small devices, the file tree is positioned on top, therefore it's better to limit
    // the height based on the display size
    if (window.innerWidth <= 768) {
      return (<TreeContainer history={this.props.history}
        {...treeProps} style={{ maxHeight: Math.floor(window.innerHeight * 2 / 3) }} />);
    }

    return (
      // This components make the file tree sticky on scroll and fix the max-height
      <StickyContainer>
        <Sticky topOffset={-10}>
          {
            ({ style, calculatedHeight, distanceFromTop }) => {
              // fix to trigger the computation
              if (calculatedHeight === undefined) {
                if (window.scrollY)
                  window.scrollTo(window.scrollX, window.scrollY + 1);
                else
                  setTimeout(() => { window.scrollTo(window.scrollX, window.scrollY + 1); }, 10);
              }

              // fix the tree scroll
              const { last } = treeStructure;
              if (last && calculatedHeight === undefined && this.props.currentUrl.endsWith(last.path)) {
                setTimeout(() => {
                  const treeElem = document.getElementById("tree-content");
                  if (treeElem)
                    treeElem.scrollTo(treeElem.scrollLeft, last.scrollTop);
                }, 10);
              }

              // adjust applied style
              const deltaDistance = distanceFromTop && distanceFromTop > 0 ?
                distanceFromTop :
                0;
              const maxHeight = window.innerHeight - 80 - deltaDistance;
              const treeStyle = { ...style, maxHeight, top: 10, transform: "" };

              return (<TreeContainer history={this.props.history} {...treeProps} style={treeStlye} />);
            }
          }
        </Sticky>
      </StickyContainer>
    );
  }

} export default FilesTreeView;
