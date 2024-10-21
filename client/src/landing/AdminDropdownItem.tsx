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

import { Link } from "react-router-dom";
import { DropdownItem } from "reactstrap";
import { useGetUserQuery } from "../features/usersV2/api/users.api";
import useLegacySelector from "../utils/customHooks/useLegacySelector.hook";

export default function AdminDropdownItem() {
  const userLogged = useLegacySelector<boolean>(
    (state) => state.stateModel.user.logged
  );

  const { data: userInfo } = useGetUserQuery();

  if (!userLogged || !userInfo?.isLoggedIn || !userInfo.is_admin) {
    return null;
  }

  return (
    <>
      <DropdownItem divider />
      <Link to="/admin" className="dropdown-item">
        Admin Panel
      </Link>
    </>
  );
}
