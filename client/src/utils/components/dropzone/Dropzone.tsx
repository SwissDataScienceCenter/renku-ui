/*!
 * Copyright 2022 - Swiss Data Science Center (SDSC)
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
import React, { useEffect } from "react";
import Dropzone from "dropzone";
import "dropzone/dist/dropzone.css";

export interface DropzoneFilesProps {
  id?: string;
  url?: string;
  onAddFile?: Function;
  onCompletedUpload? : Function;
  onProgress?: Function;
}
const DropzoneFiles = ({ id = "dropzone", url, onAddFile, onCompletedUpload, onProgress }: DropzoneFilesProps) => {

  useEffect(() => {

    const urlString = url ??
      // eslint-disable-next-line max-len
      "https://renku-ci-ui-1844.dev.renku.ch/ui-server/api/renku/cache.files_upload?override_existing=true&unpack_archive=false";
    const myId = `#${id}`;

    const myDropzone = new Dropzone(
      myId,
      {
        url: urlString,
        chunking: true,
        forceChunking: true,
      });

    myDropzone.on("addedfile", (file) => {
      if (onAddFile)
        onAddFile(file);

    });

    myDropzone.on("error", (file, message) => {
      // Add an info line about the added file for each file.
    });

    myDropzone.on("complete", (file) => {
      if (onCompletedUpload)
        onCompletedUpload(file);
    });

    myDropzone.on("uploadprogress", (file, progress, bytesSent) => {
      if (onProgress)
        onProgress(file, progress, bytesSent);
    });

    // eslint-disable-next-line
  }, []);

  return (<div className="dropzone" id={id}>
  </div>);
};

export default DropzoneFiles;
