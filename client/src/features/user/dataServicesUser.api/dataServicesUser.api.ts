import { dataServicesUserEmptyApi as api } from "./dataServicesUser-empty.api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getUser: build.query<GetUserApiResponse, GetUserApiArg>({
      query: () => ({ url: `/user` }),
    }),
    getUsers: build.query<GetUsersApiResponse, GetUsersApiArg>({
      query: (queryArg) => ({
        url: `/users`,
        params: { exact_email: queryArg.exactEmail },
      }),
    }),
    getUsersByUserId: build.query<
      GetUsersByUserIdApiResponse,
      GetUsersByUserIdApiArg
    >({
      query: (queryArg) => ({ url: `/users/${queryArg.userId}` }),
    }),
    getError: build.query<GetErrorApiResponse, GetErrorApiArg>({
      query: () => ({ url: `/error` }),
    }),
    getVersion: build.query<GetVersionApiResponse, GetVersionApiArg>({
      query: () => ({ url: `/version` }),
    }),
  }),
  overrideExisting: false,
});
export { injectedRtkApi as dataServicesUserApi };
export type GetUserApiResponse =
  /** status 200 The currently logged in user */ UserWithId;
export type GetUserApiArg = void;
export type GetUsersApiResponse =
  /** status 200 The list of users in the service (this is a subset of what is in Keycloak) */ UsersWithId;
export type GetUsersApiArg = {
  /** Return the user(s) with an exact match on the email provided */
  exactEmail?: string;
};
export type GetUsersByUserIdApiResponse =
  /** status 200 The requested user */ UserWithId;
export type GetUsersByUserIdApiArg = {
  userId: string;
};
export type GetErrorApiResponse = unknown;
export type GetErrorApiArg = void;
export type GetVersionApiResponse = /** status 200 The error */ Version;
export type GetVersionApiArg = void;
export type UserId = string;
export type UserEmail = string;
export type UserFirstLastName = string;
export type UserWithId = {
  id: UserId;
  email?: UserEmail;
  first_name?: UserFirstLastName;
  last_name?: UserFirstLastName;
};
export type UsersWithId = UserWithId[];
export type ErrorResponse = {
  error: {
    code: number;
    detail?: string;
    message: string;
  };
};
export type Version = {
  version: string;
};
export const {
  useGetUserQuery,
  useGetUsersQuery,
  useGetUsersByUserIdQuery,
  useGetErrorQuery,
  useGetVersionQuery,
} = injectedRtkApi;
