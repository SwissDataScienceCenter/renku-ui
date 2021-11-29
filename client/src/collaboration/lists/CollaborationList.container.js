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

import React, { Fragment, memo, useEffect, useRef, useState } from "react";

import { Loader, ExternalLink } from "../../utils/UIComponents";
import { renkuFetch } from "../../api-client/utils";
import _ from "lodash";

const itemsStateMap = {
  OPENED: "opened",
  MERGED: "merged",
  CLOSED: "closed"
};

const collaborationListTypeMap = {
  ISSUES: "issues",
  MREQUESTS: "mrequests" // eslint-disable-line
};

async function isValidUrlForIframe(url, serverUrl) {
  const response = await renkuFetch(`${serverUrl}/api/allows-iframe/${encodeURIComponent(url)}`, {
    method: "GET",
    headers: new Headers({ "Accept": "application/json" })
  });
  const data = await response.json();
  return data?.isIframeValid ?? false;
}

const CollaborationIframe = memo((props) => {
  const [isUrlValid, setIsUrlValid] = useState(false);

  useEffect( () => {
    async function validateUrl() {
      const isValid = await isValidUrlForIframe(props.iframeUrl, props.serverUrl);
      setIsUrlValid(isValid);
      if (!isValid)
        props.onIFrameLoad();
    }
    validateUrl();
  }, []); // eslint-disable-line

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
}, _.isEqual);
CollaborationIframe.displayName = "CollaborationIframe";

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
        <ExternalLink url={frameUrl} showLinkIcon={true} iconAfter={true}
          title="Open in Tab" className="d-inline" />
      </div>
      <div>
        <CollaborationIframe
          iframeRef={iframeRef}
          onIFrameLoad={frameLoad}
          iframeUrl={frameUrl}
          listType={props.listType}
          serverUrl={props.client?.uiserverUrl}/>
      </div>
    </div>
  </Fragment>;
}

export { CollaborationList, CollaborationIframe, itemsStateMap, collaborationListTypeMap };
