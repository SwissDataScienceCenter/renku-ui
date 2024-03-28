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
 * limitations under the License.
 */

import cx from "classnames";

import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Button, Form } from "reactstrap";

import FormSchema from "../../../components/formschema/FormSchema";
import { Loader } from "../../../components/Loader";

import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import { slugFromTitle } from "../../../utils/helpers/HelperFunctions";
import { Url } from "../../../utils/helpers/url";

import { usePostGroupsMutation } from "../api/projectV2.enhanced-api";
import type { GroupPostRequest } from "../api/namespace.api";
import DescriptionFormField from "../fields/DescriptionFormField";
import NameFormField from "../fields/NameFormField";
import SlugFormField from "../fields/SlugFormField";

import WipBadge from "../shared/WipBadge";

function GroupNewHeader() {
  return (
    <>
      <div className="mb-2">
        Groups let you group together related projects and control who can
        access them. {"  "} <WipBadge />
      </div>
    </>
  );
}

function GroupBeingCreatedLoader() {
  return (
    <div className={cx("d-flex", "justify-content-center", "w-100")}>
      <div className={cx("d-flex", "flex-column")}>
        <Loader className="me-2" />
        <div>Creating group...</div>
      </div>
    </div>
  );
}

function GroupBeingCreated({
  result,
}: {
  result: ReturnType<typeof usePostGroupsMutation>[1];
}) {
  if (result.isLoading) {
    return <GroupBeingCreatedLoader />;
  }

  if (result.isError || result.data == null) {
    return (
      <div>
        <p>Something went wrong.</p>
        <div className={cx("d-flex", "justify-content-between")}>
          <Button onClick={() => window.location.reload()}>Back</Button>
        </div>
      </div>
    );
  }
  return (
    <>
      <div>Group created.</div>
      {"  "}
      <Link to={Url.get(Url.pages.groupV2.list)}>Go to group list</Link>
    </>
  );
}

function GroupMetadataForm() {
  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
    watch,
  } = useForm<GroupPostRequest>({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  const name = watch("name");
  useEffect(() => {
    setValue("slug", slugFromTitle(name, true, true));
  }, [setValue, name]);

  const [createGroup, result] = usePostGroupsMutation();

  const onSubmit = useCallback(
    (groupPostRequest: GroupPostRequest) => {
      createGroup({ groupPostRequest });
    },
    [createGroup]
  );

  if (result != null && !result.isUninitialized) {
    return <GroupBeingCreated result={result} />;
  }

  return (
    <>
      <h4>Describe the group</h4>
      <Form
        className="form-rk-green"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <NameFormField
          control={control}
          entityName="group"
          errors={errors}
          name="name"
        />
        <SlugFormField
          control={control}
          entityName="group"
          errors={errors}
          name="slug"
        />
        <DescriptionFormField
          control={control}
          entityName="group"
          errors={errors}
          name="description"
        />
        <div className={cx("d-flex", "justify-content-between")}>
          <Link
            className={cx("btn", "btn-primary")}
            to={Url.get(Url.pages.groupV2.list)}
          >
            Cancel
          </Link>
          <div>
            <Button type="submit">Create</Button>
          </div>
        </div>
      </Form>
    </>
  );
}

export default function GroupNew() {
  const user = useLegacySelector((state) => state.stateModel.user);
  if (!user.logged) {
    return <h2>Please log in to create a group.</h2>;
  }
  return (
    <FormSchema
      showHeader={true}
      title="New Group"
      description={<GroupNewHeader />}
    >
      <GroupMetadataForm />
    </FormSchema>
  );
}
