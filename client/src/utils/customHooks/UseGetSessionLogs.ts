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
import { useEffect, useState } from "react";
import { useGetLogsQuery } from "../../features/session/sessionApi";
import { ILogs } from "../../components/Logs";

/**
 *  useGetSessionLogs custom hook
 *
 *  useGetSessionLogs.ts
 *  hook to fetch logs by serverName
 */
function useGetSessionLogs(serverName: string, show: boolean | string) {
  const { data, isFetching, isLoading, error, refetch } = useGetLogsQuery(
    { serverName, lines: 250 },
    { skip: !serverName }
  );
  const [logs, setLogs] = useState<ILogs | undefined>(undefined);
  const fetchLogs = () => {
    return refetch().then((result) => {
      if (result.isSuccess)
        return Promise.resolve(result.data as ILogs["data"]);
      return Promise.reject({} as ILogs["data"]);
    }) as Promise<ILogs["data"]>;
  };

  useEffect(() => {
    setLogs({
      data,
      fetched: !isLoading && !error && data,
      fetching: isFetching,
      show: show ? serverName : false,
    });
  }, [ data, show, isFetching, isLoading, serverName ]); //eslint-disable-line

  return { logs, fetchLogs };
}

export default useGetSessionLogs;
