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
import { useCallback, useEffect, useState } from "react";
import { CheckLg, ChevronDown, XLg } from "react-bootstrap-icons";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { generatePath, useNavigate } from "react-router-dom-v5-compat";
import {
  Button,
  Collapse,
  Form,
  FormGroup,
  FormText,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

import { RtkOrNotebooksError } from "../../../components/errors/RtkErrorAlert";
import { Loader } from "../../../components/Loader";
import LoginAlert from "../../../components/loginAlert/LoginAlert";
import { ABSOLUTE_ROUTES } from "../../../routing/routes.constants";
import useAppSelector from "../../../utils/customHooks/useAppSelector.hook";
import useLegacySelector from "../../../utils/customHooks/useLegacySelector.hook";
import { slugFromTitle } from "../../../utils/helpers/HelperFunctions";
import type { GroupPostRequest } from "../../projectsV2/api/namespace.api";
import { usePostGroupsMutation } from "../../projectsV2/api/projectV2.enhanced-api";
import DescriptionFormField from "../../projectsV2/fields/DescriptionFormField";
import NameFormField from "../../projectsV2/fields/NameFormField";
import SlugFormField from "../../projectsV2/fields/SlugFormField";
import {
  setGroupCreationModal,
  toggleGroupCreationModal,
} from "../../projectsV2/new/projectV2New.slice";

export default function GroupNew() {
  const user = useLegacySelector((state) => state.stateModel.user);
  const { showGroupCreationModal } = useAppSelector(
    (state) => state.newProjectV2
  );
  const dispatch = useDispatch();
  const toggleModal = useCallback(() => {
    dispatch(toggleGroupCreationModal());
  }, [dispatch]);

  return (
    <>
      <Modal
        backdrop="static"
        centered
        data-cy="new-group-modal"
        fullscreen="lg"
        isOpen={showGroupCreationModal}
        scrollable
        size="lg"
        unmountOnClose={true}
        toggle={toggleModal}
      >
        <ModalHeader
          data-cy="new-group-modal-header"
          tag="div"
          toggle={toggleModal}
        >
          <h2>Create a new group</h2>
          <p className={cx("fs-6", "mb-0")}>
            Groups let you group together related projects and control who can
            access them.
          </p>
        </ModalHeader>

        <div data-cy="create-new-group-content">
          {user.logged ? (
            <GroupV2CreationDetails />
          ) : (
            <ModalBody>
              <LoginAlert
                logged={user.logged}
                textIntro="Only authenticated users can create new groups."
                textPost="to create a new group."
              />
            </ModalBody>
          )}
        </div>
      </Modal>
    </>
  );
}

function GroupV2CreationDetails() {
  const [isCollapseOpen, setIsCollapseOpen] = useState(false);
  const toggleCollapse = () => setIsCollapseOpen(!isCollapseOpen);

  const [createGroup, result] = usePostGroupsMutation();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const toggleModal = useCallback(() => {
    dispatch(toggleGroupCreationModal());
  }, [dispatch]);

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
        slug: currentSlug,
      });
      navigate(groupUrl);
      dispatch(setGroupCreationModal(false));
    }
  }, [currentSlug, result, dispatch, navigate]);

  const nameHelpText = (
    <FormText className="input-hint">
      The URL for this group will be{" "}
      <span className="fw-bold">
        renkulab.io/v2/groups/{currentSlug || "<Name>"}
      </span>
    </FormText>
  );

  const resetUrl = useCallback(() => {
    setValue("slug", slugFromTitle(currentName, true, true), {
      shouldValidate: true,
    });
  }, [setValue, currentName]);

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <FormGroup className="d-inline" disabled={result.isLoading}>
          <ModalBody data-cy="new-group-modal-body">
            <div className={cx("d-flex", "flex-column", "gap-3")}>
              <div>
                <div className="mb-1">
                  <NameFormField
                    control={control}
                    entityName="group"
                    errors={errors}
                    helpText={nameHelpText}
                    name="name"
                  />
                </div>
                <div>
                  <button
                    className={cx(
                      "btn",
                      "btn-link",
                      "p-0",
                      "text-decoration-none"
                    )}
                    data-cy="group-slug-toggle"
                    onClick={toggleCollapse}
                    type="button"
                  >
                    Customize group URL <ChevronDown className="bi" />
                  </button>
                  <Collapse isOpen={isCollapseOpen}>
                    <div
                      className={cx(
                        "align-items-center",
                        "d-flex",
                        "flex-wrap",
                        "mb-0"
                      )}
                    >
                      <span>renkulab.io/v2/groups/</span>
                      <SlugFormField
                        compact={true}
                        control={control}
                        entityName="group"
                        errors={errors}
                        isDirty={dirtyFields.slug && dirtyFields.name}
                        name="slug"
                        resetFunction={resetUrl}
                      />
                    </div>
                  </Collapse>

                  {dirtyFields.slug && !dirtyFields.name ? (
                    <div className={cx("d-block", "invalid-feedback")}>
                      <p className="mb-0">
                        Mind the URL will be updated once you provide a name.
                      </p>
                    </div>
                  ) : (
                    errors.slug &&
                    dirtyFields.slug && (
                      <div className={cx("d-block", "invalid-feedback")}>
                        <p className="mb-1">
                          You can customize the slug only with lowercase
                          letters, numbers, and hyphens.
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <DescriptionFormField
                  control={control}
                  entityName="group"
                  errors={errors}
                  name="description"
                />
              </div>

              {result.error && (
                <div>
                  <RtkOrNotebooksError error={result.error} />
                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter data-cy="new-project-modal-footer">
            <Button color="outline-primary" onClick={toggleModal} type="button">
              <XLg className={cx("bi", "me-1")} />
              Cancel
            </Button>
            <Button color="primary" data-cy="group-create-button" type="submit">
              {result.isLoading ? (
                <Loader className="me-1" inline size={16} />
              ) : (
                <CheckLg className={cx("bi", "me-1")} />
              )}
              Create
            </Button>
          </ModalFooter>
        </FormGroup>
      </Form>
    </>
  );
}
