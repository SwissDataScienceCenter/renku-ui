/*!
 * Copyright 2018 - Swiss Data Science Center (SDSC)
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

import React, { Fragment, useRef, useState } from "react";

import { Loader } from "../../utils/UIComponents";

const itemsStateMap = {
  OPENED: "opened",
  MERGED: "merged",
  CLOSED: "closed"
};

const collaborationListTypeMap = {
  ISSUES: "issues",
  MREQUESTS: "mrequests" // eslint-disable-line
};

function CollaborationList(props) {
  const iframeRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  const thingIid = props.thingIid;

  let frameUrl = null;
  if (props.listType === collaborationListTypeMap.ISSUES)
    frameUrl = `${props.externalUrl}/-/issues`;
  else
    frameUrl = `${props.externalUrl}/-/merge_requests`;
  if (thingIid != null)
    frameUrl = `${frameUrl}/${thingIid}`;

  let frameLoad = () => { setLoaded(true); };
  const loaderClassName = (loaded) ? "invisible d-none" : "visible";
  const iframeClassName = (loaded) ? "visible" : "invisible";

  return <Fragment>
    <Loader className={loaderClassName}/>
    <iframe id="collaboration-iframe" title="collaboration iframe" src={frameUrl}
      ref={iframeRef}
      className={iframeClassName}
      onLoad={frameLoad}
      width="100%" height="800px" referrerPolicy="origin" sandbox="allow-same-origin allow-scripts allow-forms"
    />
  </Fragment>;
}

export { CollaborationList, itemsStateMap, collaborationListTypeMap };
