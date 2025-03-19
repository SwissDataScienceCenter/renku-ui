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

/**
 *  renku-ui
 *
 *  SessionButtons.tsx
 *  SessionButtons components.
 */

import { ArrowLeft } from "react-bootstrap-icons";
import { Link } from "@remix-run/react";

interface GoBackProps {
  urlBack: string;
}

export function GoBackBtn({ urlBack }: GoBackProps) {
  return (
    <Link
      className="fullscreen-back-button btn bg-white text-dark d-flex align-items-center gap-2 no-focus"
      role="button"
      to={urlBack}
    >
      <ArrowLeft className="text-rk-dark" title="back" /> Back
    </Link>
  );
}
