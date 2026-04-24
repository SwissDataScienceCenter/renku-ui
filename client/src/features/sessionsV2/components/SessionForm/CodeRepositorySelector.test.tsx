/*!
 * Copyright 2025 - Swiss Data Science Center (SDSC)
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

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import "@testing-library/jest-dom";

import { FormProvider, useForm } from "react-hook-form";

import {
  repositoriesApi,
  type GetRepositoriesApiResponse,
} from "~/features/repositories/api/repositories.api";
import CodeRepositorySelector from "~/features/sessionsV2/components/SessionForm/CodeRepositorySelector";

vi.mock("~/utils/context/appContext", async () => {
  const actual = await vi.importActual("~/utils/context/appContext");
  return {
    ...actual,
    AppContext: {
      Consumer: ({ children }: { children: React.ReactNode }) => children,
    },
  };
});

vi.mock("~/components/Alert", () => ({
  WarnAlert: ({ children }: { children: React.ReactNode }) => (
    <div className="warn-alert">{children}</div>
  ),
  ErrorAlert: ({ children }: { children: React.ReactNode }) => (
    <div className="error-alert">{children}</div>
  ),
}));

vi.mock("~/features/repositories/api/repositories.api", async () => {
  const actual = await vi.importActual(
    "~/features/repositories/api/repositories.api"
  );
  return {
    ...actual,
    useGetRepositoriesQuery: vi.fn(),
    repositoriesApi: {
      useGetRepositoriesQuery: vi.fn(),
    },
  };
});

vi.mock("~/features/repositories/api/repositories.utils", () => ({
  getRepositoryName: (url: string) => url.split("/").pop(),
}));

vi.mock(
  "~/features/repositories/components/RepositoryPermissionsBadge",
  () => ({
    RepositoryPermissionsBadge: ({
      repositoryUrl,
    }: {
      repositoryUrl: string;
    }) => <span data-cy="mock-permissions">{repositoryUrl}</span>,
  })
);

vi.mock(
  "~/features/repositories/components/RepositoryCallToActionAlert",
  () => ({
    RepositoryCallToActionAlert: ({
      repositoryUrl,
    }: {
      repositoryUrl: string;
    }) => <span data-cy="mock-alert">{repositoryUrl}</span>,
  })
);

vi.mock("react-hook-form", async () => {
  const actual = await vi.importActual("react-hook-form");
  return {
    ...actual,
    useWatch: vi.fn(),
  };
});

describe("CodeRepositorySelector - Private Repository Warnings", () => {
  const repositoriesDetails: GetRepositoriesApiResponse[] = [
    {
      url: "https://gitlab.com/test/public-repo",
      error: false,
      data: {
        status: "valid",
        connection: {
          id: "connection-1",
          provider_id: "gitlab",
          status: "connected",
        },
        provider: {
          id: "gitlab",
          name: "GitLab",
          url: "https://gitlab.com",
        },
        metadata: {
          git_url: "https://gitlab.com/test/public-repo.git",
          visibility: "public",
          pull_permission: true,
          push_permission: true,
        },
      },
    },
    {
      url: "https://gitlab.com/test/private-repo",
      error: false,
      data: {
        status: "valid",
        connection: {
          id: "connection-2",
          provider_id: "gitlab",
          status: "connected",
        },
        provider: {
          id: "gitlab",
          name: "GitLab",
          url: "https://gitlab.com",
        },
        metadata: {
          git_url: "https://gitlab.com/test/private-repo.git",
          visibility: "private",
          pull_permission: true,
          push_permission: true,
        },
      },
    },
  ];

  it("renders warning inline in dropdown options for private repositories", async () => {
    vi.spyOn(repositoriesApi, "useGetRepositoriesQuery").mockReturnValue({
      data: repositoriesDetails,
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof repositoriesApi.useGetRepositoriesQuery>);

    const FormWrapper = () => {
      const methods = useForm();
      return (
        <FormProvider {...methods}>
          <CodeRepositorySelector
            name="repository"
            control={methods.control}
            repositoriesDetails={repositoriesDetails}
          />
        </FormProvider>
      );
    };

    render(
      <MemoryRouter>
        <FormWrapper />
      </MemoryRouter>
    );

    // Open the dropdown to see the options
    const selectInput = screen.getByLabelText(/Code repository/i);
    fireEvent.mouseDown(selectInput);

    await waitFor(() =>
      expect(screen.queryByText(/OAuth2/i)).toBeInTheDocument()
    );
  });

  it("displays private repository warning in selected value display", async () => {
    vi.spyOn(repositoriesApi, "useGetRepositoriesQuery").mockReturnValue({
      data: repositoriesDetails,
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof repositoriesApi.useGetRepositoriesQuery>);

    const FormWrapper = () => {
      const { control } = useForm({
        defaultValues: { repository: "https://gitlab.com/test/private-repo" },
      });
      return (
        <FormProvider
          {...useForm({
            defaultValues: {
              repository: "https://gitlab.com/test/private-repo",
            },
          })}
        >
          <CodeRepositorySelector
            name="repository"
            control={control}
            repositoriesDetails={repositoriesDetails}
          />
        </FormProvider>
      );
    };

    render(
      <MemoryRouter>
        <FormWrapper />
      </MemoryRouter>
    );

    const warning = await screen.findByText(/This is a private repository/i);
    expect(warning).toBeInTheDocument();

    const oauth2Warning = await screen.findByText(/OAuth2 integration/i);
    expect(oauth2Warning).toBeInTheDocument();
  });
});
