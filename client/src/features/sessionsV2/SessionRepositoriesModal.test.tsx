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

import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import "@testing-library/jest-dom";

import { configureStore } from "@reduxjs/toolkit";

import type { Project } from "~/features/projectsV2/api/projectV2.api";
import { projectV2Api } from "~/features/projectsV2/api/projectV2.enhanced-api";
import {
  repositoriesApi,
  useGetRepositoriesQuery,
  useGetRepositoryQuery,
} from "~/features/repositories/api/repositories.api";
import SessionRepositoriesModal from "~/features/sessionsV2/SessionRepositoriesModal";

vi.mock("~/features/repositories/api/repositories.api", async () => {
  const actual = (await vi.importActual(
    "~/features/repositories/api/repositories.api"
  )) as typeof import("~/features/repositories/api/repositories.api");
  return {
    ...actual,
    useGetRepositoriesQuery: vi.fn(),
    useGetRepositoryQuery: vi.fn(),
    repositoriesApi: {
      ...actual.repositoriesApi,
      useGetRepositoriesQuery: vi.fn(),
      useGetRepositoryQuery: vi.fn(),
    },
  };
});

vi.mock("~/features/projectsV2/api/projectV2.enhanced-api", async () => {
  const actual = (await vi.importActual(
    "~/features/projectsV2/api/projectV2.enhanced-api"
  )) as typeof import("~/features/projectsV2/api/projectV2.enhanced-api");
  return {
    ...actual,
    projectV2Api: {
      ...actual.projectV2Api,
    },
  };
});

vi.mock(
  "~/features/ProjectPageV2/utils/useProjectPermissions.hook",
  async () => {
    const actual = await vi.importActual(
      "~/features/ProjectPageV2/utils/useProjectPermissions.hook"
    );
    return {
      ...actual,
      default: () => ({
        read: true,
        write: true,
      }),
    };
  }
);

vi.mock("~/routing/routes.constants", () => ({
  ABSOLUTE_ROUTES: {
    v2: {
      projects: {
        show: {
          root: "/projects/:namespace/:slug",
        },
      },
    },
  },
}));

vi.mock("~/features/usersV2/api/users.api", () => ({
  useGetUserQueryState: () => ({
    data: { isLoggedIn: true },
  }),
}));

describe("SessionRepositoriesModal - Private Repositories", () => {
  const store = configureStore({
    reducer: {
      [repositoriesApi.reducerPath]: repositoriesApi.reducer,
      [projectV2Api.reducerPath]: projectV2Api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        repositoriesApi.middleware,
        projectV2Api.middleware
      ),
  });

  const ControlWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  vi.mocked(useGetRepositoryQuery).mockReturnValue({
    data: {
      status: "valid",
      connection: { status: "connected" },
      provider: { id: "gitlab", name: "GitLab" },
      metadata: {
        visibility: "public",
        pull_permission: true,
        push_permission: true,
      },
    },
    isLoading: false,
    error: undefined,
    refetch: vi.fn(),
  } as ReturnType<typeof useGetRepositoryQuery>);

  const createRepositories = (
    repositories: { url: string; visibility: "public" | "private" }[]
  ): {
    url: string;
    data: {
      status: "valid";
      connection: { status: "connected" };
      provider: { id: string; name: string };
      metadata: {
        visibility: "public" | "private";
        pull_permission: boolean;
        push_permission: boolean;
      };
    };
  }[] =>
    repositories.map((repo) => ({
      url: repo.url,
      data: {
        status: "valid",
        connection: { status: "connected" },
        provider: { id: "gitlab", name: "GitLab" },
        metadata: {
          visibility: repo.visibility,
          pull_permission: true,
          push_permission: true,
        },
      },
    }));

  const project: Project = {
    id: "test-project",
    namespace: "test-ns",
    slug: "test-repo",
    repositories: [
      "https://gitlab.com/test/public-repo",
      "https://gitlab.com/test/private-repo",
    ],
    etag: '"test-etag"',
    name: "test-project",
    creation_date: "2025-01-01T00:00:00Z",
    created_by: "test-user",
    visibility: "public",
    secrets_mount_directory: "/secrets",
  };

  it("displays private repositories section when private repos are present", async () => {
    const repositories = createRepositories([
      { url: "https://gitlab.com/test/public-repo", visibility: "public" },
      { url: "https://gitlab.com/test/private-repo", visibility: "private" },
    ]);

    vi.mocked(useGetRepositoriesQuery).mockReturnValue({
      data: repositories,
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetRepositoriesQuery>);

    render(
      <ControlWrapper>
        <MemoryRouter>
          <SessionRepositoriesModal isOpen={true} project={project} />
        </MemoryRouter>
      </ControlWrapper>
    );

    await waitFor(() =>
      expect(screen.getByText("Private repositories:")).toBeInTheDocument()
    );

    const privateRepoWarning = screen.getByText("Private repositories:");
    expect(privateRepoWarning).toBeInTheDocument();
  });

  it("highlights private repos separately from interruption warnings", async () => {
    const repositories = createRepositories([
      { url: "https://gitlab.com/test/public-repo", visibility: "public" },
      { url: "https://gitlab.com/test/private-repo", visibility: "private" },
    ]);

    vi.mocked(useGetRepositoriesQuery).mockReturnValue({
      data: repositories,
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetRepositoriesQuery>);

    render(
      <ControlWrapper>
        <MemoryRouter>
          <SessionRepositoriesModal isOpen={true} project={project} />
        </MemoryRouter>
      </ControlWrapper>
    );

    await waitFor(() =>
      expect(screen.getByText("Private repositories:")).toBeInTheDocument()
    );

    const title = screen.getByText("Session repositories not accessible");
    expect(title).toBeInTheDocument();

    const continueButton = screen.getByText("Launch anyway");
    expect(continueButton).toBeInTheDocument();
  });

  it("does not show private repositories section when all repos are public", async () => {
    const repositories = createRepositories([
      { url: "https://gitlab.com/test/public-repo-1", visibility: "public" },
      { url: "https://gitlab.com/test/public-repo-2", visibility: "public" },
    ]);

    vi.mocked(useGetRepositoriesQuery).mockReturnValue({
      data: repositories,
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as ReturnType<typeof useGetRepositoriesQuery>);

    render(
      <ControlWrapper>
        <MemoryRouter>
          <SessionRepositoriesModal isOpen={true} project={project} />
        </MemoryRouter>
      </ControlWrapper>
    );

    await waitFor(() =>
      expect(
        screen.queryByText("Private repositories:")
      ).not.toBeInTheDocument()
    );
  });
});
