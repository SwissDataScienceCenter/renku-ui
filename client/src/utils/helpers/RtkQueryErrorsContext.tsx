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

const RtkQueryErrorsContext = createContext<RtkQueryErrorsContextType>({});
export default RtkQueryErrorsContext;

interface PropagateRtkQueryErrorProps {
  query: RtkQuery;
  isError: boolean;
  error?: FetchBaseQueryError | SerializedError;
  children?: ReactNode;
}

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
