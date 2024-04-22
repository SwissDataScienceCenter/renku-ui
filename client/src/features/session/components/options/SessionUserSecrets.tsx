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

import cx from "classnames";
import { Link } from "react-router-dom";

import { Loader } from "../../../../components/Loader";
import { User } from "../../../../model/renkuModels.types";
import useLegacySelector from "../../../../utils/customHooks/useLegacySelector.hook";
import { Url } from "../../../../utils/helpers/url";

export default function SessionUserSecrets() {
  const secretsUrl = Url.get(Url.pages.secrets);
  const user = useLegacySelector<User>((state) => state.stateModel.user);

  if (!user.fetched) return <Loader />;

  const content = user.logged ? (
    <>
      <div className={cx("form-text", "my-1")}>
        You can select secrets defined in the{" "}
        <Link to={secretsUrl}> User Secrets page</Link> and mount them as files
        in your session.
        {/* <MountUserSecrets /> */}
      </div>
    </>
  ) : (
    <div className={cx("form-text", "my-1")}>
      This feature is only available to logged users.
    </div>
  );

  return (
    <div className="field-group">
      <div className="form-label">User Secrets</div>
      {content}
    </div>
  );
}
