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

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, Mock, vi } from "vitest";

import "@testing-library/jest-dom";

import { Control, FormProvider, useForm, useWatch } from "react-hook-form";

import { useGetRepositoriesQuery } from "~/features/repositories/api/repositories.api";
import BuilderEnvironmentFields from "~/features/sessionsV2/components/SessionForm/BuilderEnvironmentFields";
import { useProject } from "~/routes/projects/root";
import AppContext from "~/utils/context/appContext";
import { DEFAULT_APP_PARAMS } from "~/utils/context/appParams.constants";
import { AppParams } from "~/utils/context/appParams.types";
import { SessionLauncherForm } from "../../sessionsV2.types";

vi.mock("~/routes/projects/root", () => ({
  useProject: vi.fn(),
}));

vi.mock("~/features/repositories/api/repositories.api", () => ({
  useGetRepositoriesQuery: vi.fn(() => ({
    data: undefined,
    isLoading: false,
    error: undefined,
    refetch: vi.fn(),
  })),
}));

vi.mock(
  "~/features/sessionsV2/components/SessionForm/CodeRepositorySelector",
  () => ({
    default: () => <div data-testid="code-repository-selector" />,
  })
);

vi.mock(
  "~/features/sessionsV2/components/SessionForm/CodeRepositoryAdvancedSettings",
  () => ({
    default: () => <div data-testid="code-repository-advanced-settings" />,
  })
);

vi.mock(
  "~/features/sessionsV2/components/SessionForm/BuilderTypeSelector",
  () => ({
    default: () => <div data-testid="builder-type-selector" />,
  })
);

vi.mock(
  "~/features/sessionsV2/components/SessionForm/BuilderFrontendSelector",
  () => ({
    default: () => <div data-testid="builder-frontend-selector" />,
  })
);

vi.mock(
  "~/features/sessionsV2/components/SessionForm/BuilderAdvancedSettings",
  () => ({
    default: () => <div data-testid="builder-advanced-settings" />,
  })
);

vi.mock("~/components/Alert", () => ({
  WarnAlert: ({ children }: { children: React.ReactNode }) => (
    <div className="warn-alert">{children}</div>
  ),
  ErrorAlert: ({ children }: { children: React.ReactNode }) => (
    <div className="error-alert">{children}</div>
  ),
}));

vi.mock("~/components/errors/RtkOrDataServicesError", () => ({
  default: () => <div data-testid="rtk-error" />,
}));

vi.mock("react-hook-form", async () => {
  const actual = await vi.importActual("react-hook-form");
  return {
    ...actual,
    useWatch: vi.fn(),
  };
});

const mockRepos = [
  {
    url: "https://gitlab.com/test/repo1",
    data: {
      status: "valid",
      metadata: { visibility: "public", pull_permission: true },
    },
  },
  {
    url: "https://gitlab.com/test/repo2",
    data: {
      status: "valid",
      metadata: { visibility: "private", pull_permission: true },
    },
  },
];

interface TestWrapperProps {
  children: React.ReactNode;
  appParams?: { [K in keyof AppParams]?: AppParams[K] };
  projectRepositories?: string[];
}

const TestWrapper = ({
  children,
  appParams = { IMAGE_BUILDERS_ENABLED: true },
  projectRepositories = [],
}: TestWrapperProps) => {
  vi.mocked(useProject).mockReturnValue({
    project: { repositories: projectRepositories },
  } as unknown as ReturnType<typeof useProject>);

  return (
    <AppContext.Provider
      value={{ params: { ...DEFAULT_APP_PARAMS, ...appParams } }}
    >
      <MemoryRouter>{children}</MemoryRouter>
    </AppContext.Provider>
  );
};

describe("BuilderEnvironmentFields", () => {
  interface FormComponentProps {
    children: (control: Control<SessionLauncherForm>) => React.ReactElement;
  }

  const FormComponent = ({ children }: FormComponentProps) => {
    const methods = useForm<SessionLauncherForm>();
    return (
      <FormProvider {...methods}>{children(methods.control)}</FormProvider>
    );
  };

  it("renders ErrorAlert when image builders are disabled", () => {
    render(
      <TestWrapper appParams={{ IMAGE_BUILDERS_ENABLED: false }}>
        <FormComponent>
          {(control) => <BuilderEnvironmentFields control={control} />}
        </FormComponent>
      </TestWrapper>
    );

    expect(
      screen.getByText(
        /Creating a session environment from code is not currently supported/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Creating a session environment from code is not currently supported/i
      )
    ).toHaveClass("error-alert");
  });

  it("renders Loader when repositories are loading", () => {
    vi.mocked(useGetRepositoriesQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGetRepositoriesQuery>);

    render(
      <TestWrapper projectRepositories={["https://gitlab.com/test/repo1"]}>
        <FormComponent>
          {(control) => <BuilderEnvironmentFields control={control} />}
        </FormComponent>
      </TestWrapper>
    );

    expect(
      screen.getByText(/Checking project repositories.../i)
    ).toBeInTheDocument();
  });

  it("renders WarnAlert when no repositories are found in project", () => {
    vi.mocked(useGetRepositoriesQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGetRepositoriesQuery>);

    render(
      <TestWrapper projectRepositories={[]}>
        <FormComponent>
          {(control) => <BuilderEnvironmentFields control={control} />}
        </FormComponent>
      </TestWrapper>
    );

    expect(
      screen.getByText(/No accessible code repositories found in this project/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No accessible code repositories found in this project/i)
    ).toHaveClass("warn-alert");
  });

  it("renders error message and RtkOrDataServicesError when API fails", () => {
    const mockError = { status: 500, data: "Internal Server Error" };
    vi.mocked(useGetRepositoriesQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGetRepositoriesQuery>);

    render(
      <TestWrapper projectRepositories={["https://gitlab.com/test/repo1"]}>
        <FormComponent>
          {(control) => <BuilderEnvironmentFields control={control} />}
        </FormComponent>
      </TestWrapper>
    );

    expect(
      screen.getByText(/Error: could not check code repositories/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId("rtk-error")).toBeInTheDocument();
  });

  it("renders WarnAlert when no repositories are eligible (invalid or no pull permission)", () => {
    const ineligibleRepos = [
      {
        url: "https://gitlab.com/test/repo1",
        data: { status: "invalid", metadata: { pull_permission: true } },
      },
      {
        url: "https://gitlab.com/test/repo2",
        data: { status: "valid", metadata: { pull_permission: false } },
      },
    ];
    vi.mocked(useGetRepositoriesQuery).mockReturnValue({
      data: ineligibleRepos,
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGetRepositoriesQuery>);

    render(
      <TestWrapper
        projectRepositories={[
          "https://gitlab.com/test/repo1",
          "https://gitlab.com/test/repo2",
        ]}
      >
        <FormComponent>
          {(control) => <BuilderEnvironmentFields control={control} />}
        </FormComponent>
      </TestWrapper>
    );

    expect(
      screen.getByText(/No accessible code repositories found in this project/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No accessible code repositories found in this project/i)
    ).toHaveClass("warn-alert");
  });

  it("renders all selectors when repositories are available and eligible", () => {
    vi.mocked(useGetRepositoriesQuery).mockReturnValue({
      data: mockRepos,
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGetRepositoriesQuery>);

    render(
      <TestWrapper projectRepositories={["https://gitlab.com/test/repo1"]}>
        <FormComponent>
          {(control) => <BuilderEnvironmentFields control={control} />}
        </FormComponent>
      </TestWrapper>
    );

    expect(screen.getByTestId("code-repository-selector")).toBeInTheDocument();
    expect(
      screen.getByTestId("code-repository-advanced-settings")
    ).toBeInTheDocument();
    expect(screen.getByTestId("builder-type-selector")).toBeInTheDocument();
    expect(screen.getByTestId("builder-frontend-selector")).toBeInTheDocument();
    expect(screen.getByTestId("builder-advanced-settings")).toBeInTheDocument();
  });

  it("shows helper text when isEdit is false", () => {
    vi.mocked(useGetRepositoriesQuery).mockReturnValue({
      data: mockRepos,
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGetRepositoriesQuery>);

    render(
      <TestWrapper projectRepositories={["https://gitlab.com/test/repo1"]}>
        <FormComponent>
          {(control) => (
            <BuilderEnvironmentFields control={control} isEdit={false} />
          )}
        </FormComponent>
      </TestWrapper>
    );

    expect(
      screen.getByText(
        /Let RenkuLab create a customized environment from a code repository/i
      )
    ).toBeInTheDocument();
  });

  it("hides helper text when isEdit is true", () => {
    vi.mocked(useGetRepositoriesQuery).mockReturnValue({
      data: mockRepos,
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGetRepositoriesQuery>);

    render(
      <TestWrapper projectRepositories={["https://gitlab.com/test/repo1"]}>
        <FormComponent>
          {(control) => (
            <BuilderEnvironmentFields control={control} isEdit={true} />
          )}
        </FormComponent>
      </TestWrapper>
    );

    expect(
      screen.queryByText(
        /Let RenkuLab create a customized environment from a code repository/i
      )
    ).not.toBeInTheDocument();
  });

  it("renders private repository warning when a private repository is selected", () => {
    vi.mocked(useGetRepositoriesQuery).mockReturnValue({
      data: mockRepos,
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGetRepositoriesQuery>);

    (vi.mocked(useWatch) as unknown as Mock).mockReturnValue(
      "https://gitlab.com/test/repo2"
    );

    render(
      <TestWrapper
        projectRepositories={[
          "https://gitlab.com/test/repo1",
          "https://gitlab.com/test/repo2",
        ]}
      >
        <FormComponent>
          {(control) => <BuilderEnvironmentFields control={control} />}
        </FormComponent>
      </TestWrapper>
    );

    expect(
      screen.getByText(/This is a private repository/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/This is a private repository/i)).toHaveClass(
      "warn-alert"
    );
  });

  it("does not render private repository warning when a public repository is selected", () => {
    vi.mocked(useGetRepositoriesQuery).mockReturnValue({
      data: mockRepos,
      isLoading: false,
      error: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useGetRepositoriesQuery>);

    (vi.mocked(useWatch) as unknown as Mock).mockReturnValue(
      "https://gitlab.com/test/repo1"
    );

    render(
      <TestWrapper projectRepositories={["https://gitlab.com/test/repo1"]}>
        <FormComponent>
          {(control) => <BuilderEnvironmentFields control={control} />}
        </FormComponent>
      </TestWrapper>
    );

    expect(
      screen.queryByText(/This is a private repository/i)
    ).not.toBeInTheDocument();
  });
});
