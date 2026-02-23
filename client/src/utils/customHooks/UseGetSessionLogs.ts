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

import { useCallback, useEffect, useState } from "react";

import { ILogs } from "../../components/Logs";
import { useGetSessionsBySessionIdLogsQuery as useGetLogsQueryV2 } from "../../features/sessionsV2/api/sessionsV2.api";

export function useGetSessionLogsV2(
  serverName: string,
  show: boolean | string
) {
  const { data, isFetching, isLoading, error, refetch } = useGetLogsQueryV2(
    { sessionId: serverName, maxLines: 250 },
    { skip: !serverName }
  );
  const [logs, setLogs] = useState<ILogs | undefined>(undefined);
  const fetchLogs = useCallback(() => {
    return refetch().then((result) => {
      if (result.isSuccess)
        return Promise.resolve(result.data as ILogs["data"]);
      return Promise.reject({} as ILogs["data"]);
    }) as Promise<ILogs["data"]>;
  }, [refetch]);

  useEffect(() => {
    setLogs({
      data: data ?? {},
      fetched: !isLoading && !error && !!data,
      fetching: isFetching,
      show: show ? serverName : false,
    });
  }, [data, error, show, isFetching, isLoading, serverName]);

  return { logs, fetchLogs };
}
