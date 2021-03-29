/*!
 * Copyright 2021 - Swiss Data Science Center (SDSC)
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

/**
 *  renku-ui
 *
 *  IFrameTest.js
 *  Components for testing IFrames
 */

 import React, { useState } from "react";

  import { FieldGroup } from "./utils/UIComponents";

 
 function IFrameTest(props) {
    const [srcUrl, setSrcUrl] = useState("https://www.wikipedia.org/");
    const [sandboxPolicy, setSandboxPolicy] = useState("allow-forms allow-same-origin allow-scripts allow-top-navigation")
    
 
    return [
    <div key="form">
      <FieldGroup id="iframe_src" type="text" label="iframe src"
        value={srcUrl}
        placeholder="Enter a src for the iframe component" 
        help="E.g., https://dev.renku.ch/jupyterhub/user/cramakri/ROS-Examples-da378888/"
        onChange={(e) => setSrcUrl(e.target.value)} />

    <FieldGroup id="sandbox" type="text" label="iframe sandbox"
        value={sandboxPolicy}
        placeholder="Enter a sandbox for the iframe component" 
        help="E.g., allow-forms allow-same-origin allow-scripts allow-top-navigation"
        onChange={(e) => setSandboxPolicy(e.target.value)} />        
    </div>,
    <iframe key="iframe" id="iframe_iframe" title="iframe test" src={srcUrl} width="100%" height="800px" referrerPolicy="origin"
        sandbox={sandboxPolicy}>
    </iframe>
    ]
 }
 
 
 export { IFrameTest };
 