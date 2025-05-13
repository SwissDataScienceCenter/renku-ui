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
import { CheckLg, People, XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import { generatePath, useNavigate } from "react-router";
import { Button, Form, FormGroup, ModalBody, ModalFooter } from "reactstrap";

import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../components/Loader";
import LoginAlert from "../../../components/loginAlert/LoginAlert";
import ModalHeader from "../../../components/modal/ModalHeader";
import ScrollableModal from "../../../components/modal/ScrollableModal";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import useLocationHash from "../../../utils/customHooks/useLocationHash.hook";
import { slugFromTitle } from "../../../utils/helpers/HelperFunctions";
import type { GroupPostRequest } from "../../projectsV2/api/namespace.api";
import { usePostGroupsMutation } from "../../projectsV2/api/projectV2.enhanced-api";
import DescriptionFormField from "../../projectsV2/fields/DescriptionFormField";
import NameFormField from "../../projectsV2/fields/NameFormField";
import SlugPreviewFormField from "../../projectsV2/fields/SlugPreviewFormField";
import { useGetUserQuery } from "../../usersV2/api/users.api";
import { GROUP_CREATION_HASH } from "./createGroup.constants";

export default function GroupNew() {
  const { data: userInfo, isLoading: userLoading } = useGetUserQuery();

  const [hash, setHash] = useLocationHash();
  const showGroupCreationModal = hash === GROUP_CREATION_HASH;
  const toggleModal = useCallback(() => {
    setHash((prev) => {
      const isOpen = prev === GROUP_CREATION_HASH;
      return isOpen ? "" : GROUP_CREATION_HASH;
    });
  }, [setHash]);

  return (
    <>
      <ScrollableModal
        backdrop="static"
        centered
        data-cy="new-group-modal"
        fullscreen="lg"
        isOpen={showGroupCreationModal}
        size="lg"
        unmountOnClose={true}
        toggle={toggleModal}
      >
        <ModalHeader
          toggle={toggleModal}
          modalTitle={
            <>
              <People className="bi" />
              Create a new group
            </>
          }
        >
          <p className={cx("fs-6", "fw-normal", "mb-0")}>
            Groups let you group together related projects and control who can
            access them.
          </p>
        </ModalHeader>

        <div data-cy="create-new-group-content">
          {userLoading ? (
            <ModalBody>
              <Loader />
            </ModalBody>
          ) : userInfo?.isLoggedIn ? (
            <GroupV2CreationDetails />
          ) : (
            <ModalBody>
              <LoginAlert
                logged={userInfo?.isLoggedIn ?? false}
                textIntro="Only authenticated users can create new groups."
                textPost="to create a new group."
              />
            </ModalBody>
          )}
        </div>
      </ScrollableModal>
    </>
  );
}

function GroupV2CreationDetails() {
  const [createGroup, result] = usePostGroupsMutation();
  const navigate = useNavigate();

  const [, setHash] = useLocationHash();
  const closeModal = useCallback(() => {
    setHash();
  }, [setHash]);

  // Form initialization
  const {
    control,
    formState: { dirtyFields, errors },
    handleSubmit,
    setValue,
    watch,
  } = useForm<GroupPostRequest>({
    mode: "onChange",
    defaultValues: {
      description: "",
      name: "",
      slug: "",
    },
  });

  // We watch for changes in the name and derive the slug from it
  const currentName = watch("name");
  useEffect(() => {
    setValue("slug", slugFromTitle(currentName, true, true), {
      shouldValidate: true,
    });
  }, [currentName, setValue]);

  // Slug is use to show the projected URL
  const currentSlug = watch("slug");

  // Group creation utilities
  const onSubmit = useCallback(
    (groupPostRequest: GroupPostRequest) => {
      createGroup({ groupPostRequest });
    },
    [createGroup]
  );

  useEffect(() => {
    if (result.isSuccess) {
      const groupUrl = generatePath(ABSOLUTE_ROUTES.v2.groups.show.root, {
        slug: result.data.slug,
      });
      navigate(groupUrl);
    }
  }, [result, navigate]);

  const url = "renkulab.io/v2/groups/";

  const resetUrl = useCallback(() => {
    setValue("slug", slugFromTitle(currentName, true, true), {
      shouldValidate: true,
    });
  }, [setValue, currentName]);

  return (
    <>
      <ModalBody>
        <Form
          data-cy="group-creation-form"
          id="group-creation-form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormGroup className="d-inline" disabled={result.isLoading}>
            <div className={cx("d-flex", "flex-column", "gap-3")}>
              <div className="mb-1">
                <NameFormField
                  control={control}
                  entityName="group"
                  errors={errors}
                  name="name"
                />
              </div>

              <SlugPreviewFormField
                compact={true}
                control={control}
                errors={errors}
                name="slug"
                resetFunction={resetUrl}
                url={url}
                slug={currentSlug}
                dirtyFields={dirtyFields}
                label="Group URL"
                entityName="group"
              />

              <DescriptionFormField
                control={control}
                entityName="group"
                errors={errors}
                name="description"
              />

              {result.error && <RtkOrNotebooksError error={result.error} />}
            </div>
          </FormGroup>
        </Form>
      </ModalBody>

      <ModalFooter>
        <Button color="outline-primary" onClick={closeModal} type="button">
          <XLg className={cx("bi", "me-1")} />
          Cancel
        </Button>
        <Button
          color="primary"
          data-cy="group-create-button"
          form="group-creation-form"
          type="submit"
        >
          {result.isLoading ? (
            <Loader className="me-1" inline size={16} />
          ) : (
            <CheckLg className={cx("bi", "me-1")} />
          )}
          Create
        </Button>
      </ModalFooter>
    </>
  );
}
