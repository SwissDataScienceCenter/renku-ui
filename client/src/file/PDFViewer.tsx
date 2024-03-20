/*!
 * Copyright 2023 - Swiss Data Science Center (SDSC)
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

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

interface PdfViewerProps {
  file: string;
}

export default function PDFViewer(props: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | undefined>(undefined);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <Document
      file={props.file}
      onLoadSuccess={onDocumentLoadSuccess}
      renderMode="svg"
    >
      {Array.from(new Array(numPages), (_el, index) => (
        <Page
          className="rk-pdf-page"
          key={`page_${index + 1}`}
          pageNumber={index + 1}
        />
      ))}
    </Document>
  );
}
