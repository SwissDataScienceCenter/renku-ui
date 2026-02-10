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

import cx from "classnames";
import { useCallback } from "react";
import { toast, type ToastOptions } from "react-toastify";

import {
  CloseButton,
  RenkuToast,
  RenkuToastDanger,
  RenkuToastInfo,
  RenkuToastSuccess,
  RenkuToastWarning,
  type RenkuToastProps,
  type RenkuTypedToastProps,
} from "./RenkuToast";

type UseRenkuToastReturn = {
  /** The `toast` function from `react-toastify`. Use for full customization. */
  toast: typeof toast;
  /** Send a base Renku toast. */
  renkuToast: (props: RenkuToastProps, options?: ToastOptions) => void;
  /** Send a success Renku toast. */
  renkuToastSuccess: (
    props: RenkuTypedToastProps,
    options?: ToastOptions
  ) => void;
  /** Send a danger Renku toast. */
  renkuToastDanger: (
    props: RenkuTypedToastProps,
    options?: ToastOptions
  ) => void;
  /** Send a warning Renku toast. */
  renkuToastWarning: (
    props: RenkuTypedToastProps,
    options?: ToastOptions
  ) => void;
  /** Send an info Renku toast. */
  renkuToastInfo: (props: RenkuTypedToastProps, options?: ToastOptions) => void;
};

export default function useRenkuToast(): UseRenkuToastReturn {
  const renkuToast = useCallback(
    (props: RenkuToastProps, options?: ToastOptions) => {
      toast(<RenkuToast {...props} />, { ...RENKU_TOAST_OPTIONS, ...options });
    },
    []
  );
  const renkuToastSuccess = useCallback(
    (props: RenkuTypedToastProps, options?: ToastOptions) => {
      toast(<RenkuToastSuccess {...props} />, {
        ...RENKU_TOAST_SUCCESS_OPTIONS,
        ...options,
      });
    },
    []
  );
  const renkuToastDanger = useCallback(
    (props: RenkuTypedToastProps, options?: ToastOptions) => {
      toast(<RenkuToastDanger {...props} />, {
        ...RENKU_TOAST_DANGER_OPTIONS,
        ...options,
      });
    },
    []
  );
  const renkuToastWarning = useCallback(
    (props: RenkuTypedToastProps, options?: ToastOptions) => {
      toast(<RenkuToastWarning {...props} />, {
        ...RENKU_TOAST_WARNING_OPTIONS,
        ...options,
      });
    },
    []
  );
  const renkuToastInfo = useCallback(
    (props: RenkuTypedToastProps, options?: ToastOptions) => {
      toast(<RenkuToastInfo {...props} />, {
        ...RENKU_TOAST_INFO_OPTIONS,
        ...options,
      });
    },
    []
  );
  return {
    toast,
    renkuToast,
    renkuToastSuccess,
    renkuToastDanger,
    renkuToastWarning,
    renkuToastInfo,
  };
}

const RENKU_TOAST_OPTIONS: Readonly<ToastOptions> = {
  closeOnClick: false,
  className: cx("card", "rounded", "flex-row"),
  position: "top-right",
  autoClose: 7_500,
  closeButton: CloseButton,
  progressClassName: "bg-secondary",
};

const RENKU_TOAST_SUCCESS_OPTIONS: Readonly<ToastOptions> = {
  ...RENKU_TOAST_OPTIONS,
  progressClassName: "bg-success",
};

const RENKU_TOAST_DANGER_OPTIONS: Readonly<ToastOptions> = {
  ...RENKU_TOAST_OPTIONS,
  progressClassName: "bg-danger",
};

const RENKU_TOAST_WARNING_OPTIONS: Readonly<ToastOptions> = {
  ...RENKU_TOAST_OPTIONS,
  progressClassName: "bg-warning",
};

const RENKU_TOAST_INFO_OPTIONS: Readonly<ToastOptions> = {
  ...RENKU_TOAST_OPTIONS,
  progressClassName: "bg-info",
};
