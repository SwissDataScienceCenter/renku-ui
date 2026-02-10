/*!
 * Copyright 2026 - Swiss Data Science Center (SDSC)
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

import { useCallback } from "react";

import useRenkuToast from "~/components/toast/useRenkuToast";
import { triggerNotifications } from "./listeners.client";

export function useTriggerNotifications(): () => void {
  const {
    renkuToastSuccess: renkuToastSuccess_,
    renkuToastWarning: renkuToastWarning_,
  } = useRenkuToast();

  //? We need to delay the toast because the toast container component is mounted at the same time
  const renkuToastSuccess: typeof renkuToastSuccess_ = useCallback(
    (props, options) => {
      window.setTimeout(() => renkuToastSuccess_(props, options), 1);
    },
    [renkuToastSuccess_]
  );
  const renkuToastWarning: typeof renkuToastWarning_ = useCallback(
    (props, options) => {
      window.setTimeout(() => renkuToastWarning_(props, options), 1);
    },
    [renkuToastWarning_]
  );

  return useCallback(() => {
    triggerNotifications({ renkuToastSuccess, renkuToastWarning });
  }, [renkuToastSuccess, renkuToastWarning]);
}
