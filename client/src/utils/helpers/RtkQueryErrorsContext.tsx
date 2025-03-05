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

import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { ReactNode, createContext, useContext, useMemo } from "react";

export enum RtkQuery {
  getSessions = "getSessions",
}

type RtkQueryErrorsContextType = {
  [key in RtkQuery]?: {
    isError: boolean;
    error?: FetchBaseQueryError | SerializedError;
  };
};

/**
 * Context which propagates RTK Query errors down the component tree.
 *
 * RTK Query cache does not store errors which can create issues
 * when a child component uses data from the errored query.
 *
 * Example:
 * ```tsx
 * function ProjectsDashboard() {
 *   const { data: sessions } = useGetSessionsQuery();
 *   return (
 *     <>
 *       {sessions.map((session) => (<Session key={sessionid} session={session} />))}
 *     </>
 *   );
 * }
 *
 * function Session() {
 *   const { data: sessions } = useGetSessionsQuery();  // <-- This will query again in case of error!
 *
 *   return (
 *     <div>[...]</div>
 *   );
 * }
 * ```
 *
 * In this example, we can have an infinite render loop when the "getSessions"
 * query errors.
 *
 * The `RtkQueryErrorsContext` is used to propagate the query errors to be
 * consumed by nested components.
 *
 * Example usage:
 * ```tsx
 * function Session() {
 *   const { getSessions } = useContext(RtkQueryErrorsContext);
 *   const { data: sessions, isError } = useGetSessionsQuery(!!getSessions?.isError ? undefined : skipToken);
 *
 *   return (
 *     <>
 *       {(isError || getSessions?.isError) && (<p>An error happened</p>)}
 *       [...]
 *     </>
 *   );
 * }
 * ```
 */
const RtkQueryErrorsContext = createContext<RtkQueryErrorsContextType>({});
export default RtkQueryErrorsContext;

interface PropagateRtkQueryErrorProps {
  query: RtkQuery;
  isError: boolean;
  error?: FetchBaseQueryError | SerializedError;
  children?: ReactNode;
}

/**
 * Propagates down an error from RTK Query
 *
 * Example usage:
 * ```tsx
 * function ProjectsDashboard() {
 *   const { data: sessions, isError, error } = useGetSessionsQuery();
 *   return (
 *     <PropagateRtkQueryError
 *       query={RtkQuery.getSessions}
 *       isError={isErrorSessions}
 *       error={sessionsError}
 *     >
 *       {sessions.map((session) => (<Session key={sessionid} session={session} />))}
 *     </PropagateRtkQueryError>
 *   );
 * }
 * ```
 */
export function PropagateRtkQueryError({
  query,
  isError,
  error,
  children,
}: PropagateRtkQueryErrorProps) {
  const context = useContext(RtkQueryErrorsContext);
  const newContext = useMemo(
    () => ({ ...context, [query]: { isError, error } }),
    [context, error, isError, query]
  );

  return (
    <RtkQueryErrorsContext.Provider value={newContext}>
      {children}
    </RtkQueryErrorsContext.Provider>
  );
}
