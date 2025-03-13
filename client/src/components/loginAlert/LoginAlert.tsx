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
 *  LoginAlert.tsx
 *  LoginAlert component
 */

import cx from "classnames";
import { Alert } from "reactstrap";

import { useLoginUrl } from "../../authentication/useLoginUrl.hook";

export interface LoginAlertProps {
  logged: boolean;
  noWrapper?: boolean;
  textIntro?: string;
  textLogin?: string;
  textPost?: string;
  textPre?: string;
}

const LoginAlert = ({
  logged,
  noWrapper,
  textLogin = "Log in",
  textIntro,
  textPost = " to use this feature.",
  textPre,
}: LoginAlertProps) => {
  const loginUrl = useLoginUrl();

  // No need to show anything when the user is logged.
  if (logged) return null;

  const link = (
    <a className={cx("btn", "btn-primary", "btn-sm")} href={loginUrl.href}>
      {textLogin}
    </a>
  );
  const introElement = textIntro ? <p>{textIntro}</p> : null;

  if (noWrapper)
    return (
      <span>
        {textPre} {link} {textPost}
      </span>
    );

  return (
    <>
      {introElement}
      <Alert color="primary">
        <p className="mb-0">
          {textPre} {link} {textPost}
        </p>
      </Alert>
    </>
  );
};

export default LoginAlert;
