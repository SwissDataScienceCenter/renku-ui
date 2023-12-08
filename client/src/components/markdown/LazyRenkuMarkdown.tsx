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

import { ComponentProps, Suspense, lazy } from "react";
import { Loader } from "../Loader";

const RenkuMarkdown = lazy(() =>
  import("./RenkuMarkdown").then((module) => ({
    default: module.RenkuMarkdown,
  }))
);

// ? Lazy loading of Markdown components allows us to split off ~700kB from
// ? the main bundle.
export default function LazyRenkuMarkdown(
  props: ComponentProps<typeof RenkuMarkdown>
) {
  return (
    <Suspense fallback={<Loader size={30} />}>
      <RenkuMarkdown {...props} />
    </Suspense>
  );
}
