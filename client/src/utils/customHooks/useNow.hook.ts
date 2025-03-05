/*!
 * Copyright 2024 - Swiss Data Science Center (SDSC)
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
 * limitations under the License
 */

import { DateTime, Duration } from "luxon";
import { useEffect, useMemo, useRef, useState } from "react";

interface UseNowArgs {
  refresh?: Duration;
}
/**
 * Provides `now` for functional components, refreshed using `refresh` intervals.
 */
export default function useNow(args?: UseNowArgs) {
  const refresh = useMemo(
    () => args?.refresh ?? Duration.fromObject({ minute: 1 }),
    [args?.refresh]
  );

  const [now, setNow] = useState<DateTime>(DateTime.utc());

  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    timeoutRef.current = window.setInterval(() => {
      setNow(DateTime.utc());
    }, refresh.valueOf());
    return () => {
      if (timeoutRef.current) {
        window.clearInterval(timeoutRef.current);
      }
      timeoutRef.current = null;
    };
  }, [refresh]);

  return now;
}
