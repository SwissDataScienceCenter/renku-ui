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

import React, { Fragment, useEffect, useRef, useState } from "react";
import { ExternalLink } from "../../utils/components/ExternalLinks";
import { Loader } from "../../utils/components/Loader";

const itemsStateMap = {
  OPENED: "opened",
  MERGED: "merged",
  CLOSED: "closed"
};

const collaborationListTypeMap = {
  ISSUES: "issues",
  MREQUESTS: "mrequests" // eslint-disable-line
};

const CollaborationIframe = (props) => {
  const [isUrlValid, setIsUrlValid] = useState(false);

  useEffect( () => {
    async function validateUrl() {
      const isValid = await props.client.isValidUrlForIframe(props.iframeUrl);
      setIsUrlValid(isValid);
      if (!isValid)
        props.onIFrameLoad();
    }
    validateUrl();
  }, [props.iframeUrl]); // eslint-disable-line

  const type = props.listType === collaborationListTypeMap.ISSUES ? "Issues" : "Merge Requests";

  return isUrlValid ?
    <iframe id="collaboration-iframe" title="collaboration iframe" src={props.iframeUrl}
      ref={props.iframeRef}
      onLoad={props.onIFrameLoad}
      width="100%" height="800px" referrerPolicy="origin" sandbox="allow-same-origin allow-scripts allow-forms"
    /> : <div className="my-4">
      This Gitlab instance cannot be embedded in RenkuLab. Please
      <ExternalLink role="text" url={props.iframeUrl} title="Open in a separate tab" className="mx-1" />
      to access {type} </div>;
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
    <Loader className={loaderClassName} />
    <div className={`d-flex flex-column ${iframeClassName}`}>
      <div className="mb-3">
        <ExternalLink url={frameUrl} showLinkIcon={true} iconAfter={false}
          title="Open in Tab" className="btn-outline-rk-green" />
      </div>
      <div>
        <CollaborationIframe
          iframeRef={iframeRef}
          onIFrameLoad={frameLoad}
          iframeUrl={frameUrl}
          listType={props.listType}
          client={props.client}/>
      </div>
    </div>
  </Fragment>;
}

export { CollaborationList, CollaborationIframe, itemsStateMap, collaborationListTypeMap };
