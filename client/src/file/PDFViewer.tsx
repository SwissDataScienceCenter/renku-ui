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

import { throttle } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

interface PdfViewerProps {
  file: string;
}

export default function PDFViewer(props: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
    },
    []
  );

  const ref = useRef<HTMLDivElement>(null);

  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    if (ref.current != null) {
      setWidth(Math.floor(ref.current.offsetWidth) - 2);
    }
  }, []);

  useEffect(() => {
    function handleResize() {
      if (ref.current != null) {
        setWidth(Math.floor(ref.current.offsetWidth) - 2);
      }
    }
    const throttled = throttle(handleResize, /*wait=*/ 200, { trailing: true });

    window.addEventListener("resize", throttled);

    return () => {
      window.removeEventListener("resize", throttled);
    };
  }, []);

  return (
    <Document
      inputRef={ref}
      className="overflow-y-hidden"
      file={props.file}
      onLoadSuccess={onDocumentLoadSuccess}
      renderMode="canvas"
    >
      {Array.from(new Array(numPages), (_el, index) => (
        <Page key={`page_${index + 1}`} pageNumber={index + 1} width={width} />
      ))}
    </Document>
  );
}
