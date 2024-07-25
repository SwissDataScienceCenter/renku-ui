import { dataServicesUserEmptyApi as api } from "./dataServicesUser.empty-api";
const injectedRtkApi = api.injectEndpoints({
  endpoints: (build) => ({
    getUser: build.query<GetUserApiResponse, GetUserApiArg>({
      query: () => ({ url: `/user` }),
    }),
    getUserSecretKey: build.query<
      GetUserSecretKeyApiResponse,
      GetUserSecretKeyApiArg
    >({
      query: () => ({ url: `/user/secret_key` }),
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
    getUserSecrets: build.query<
      GetUserSecretsApiResponse,
      GetUserSecretsApiArg
    >({
      query: (queryArg) => ({
        url: `/user/secrets`,
        params: { kind: queryArg.kind },
      }),
    }),
    postUserSecrets: build.mutation<
      PostUserSecretsApiResponse,
      PostUserSecretsApiArg
    >({
      query: (queryArg) => ({
        url: `/user/secrets`,
        method: "POST",
        body: queryArg.secretPost,
      }),
    }),
    getUserSecretsBySecretId: build.query<
      GetUserSecretsBySecretIdApiResponse,
      GetUserSecretsBySecretIdApiArg
    >({
      query: (queryArg) => ({ url: `/user/secrets/${queryArg.secretId}` }),
    }),
    patchUserSecretsBySecretId: build.mutation<
      PatchUserSecretsBySecretIdApiResponse,
      PatchUserSecretsBySecretIdApiArg
    >({
      query: (queryArg) => ({
        url: `/user/secrets/${queryArg.secretId}`,
        method: "PATCH",
        body: queryArg.secretPatch,
      }),
    }),
    deleteUserSecretsBySecretId: build.mutation<
      DeleteUserSecretsBySecretIdApiResponse,
      DeleteUserSecretsBySecretIdApiArg
    >({
      query: (queryArg) => ({
        url: `/user/secrets/${queryArg.secretId}`,
        method: "DELETE",
      }),
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
export { injectedRtkApi as dataServicesUserGeneratedApi };
export type GetUserApiResponse =
  /** status 200 The currently logged in user */ UserWithId;
export type GetUserApiArg = void;
export type GetUserSecretKeyApiResponse =
  /** status 200 The secret key of the currently logged in user.
This endpoint is not publicly accessible.
 */ UserSecretKey;
export type GetUserSecretKeyApiArg = void;
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
export type GetUserSecretsApiResponse =
  /** status 200 The user's secrets */ SecretsList;
export type GetUserSecretsApiArg = {
  /** Filter results based on secret kind */
  kind?: SecretKind;
};
export type PostUserSecretsApiResponse =
  /** status 201 Secret successfully created */ SecretWithId;
export type PostUserSecretsApiArg = {
  secretPost: SecretPost;
};
export type GetUserSecretsBySecretIdApiResponse =
  /** status 200 The secret */ SecretWithId;
export type GetUserSecretsBySecretIdApiArg = {
  secretId: string;
};
export type PatchUserSecretsBySecretIdApiResponse =
  /** status 201 Secret successfully changed */ SecretWithId;
export type PatchUserSecretsBySecretIdApiArg = {
  secretId: string;
  secretPatch: SecretPatch;
};
export type DeleteUserSecretsBySecretIdApiResponse =
  /** status 204 The secret was deleted or didn't exist */ void;
export type DeleteUserSecretsBySecretIdApiArg = {
  secretId: string;
};
export type GetErrorApiResponse = unknown;
export type GetErrorApiArg = void;
export type GetVersionApiResponse = /** status 200 The error */ Version;
export type GetVersionApiArg = void;
export type UserId = string;
export type Username = string;
export type UserEmail = string;
export type UserFirstLastName = string;
export type UserWithId = {
  id: UserId;
  username: Username;
  email?: UserEmail;
  first_name?: UserFirstLastName;
  last_name?: UserFirstLastName;
};
export type ErrorResponse = {
  error: {
    code: number;
    detail?: string;
    message: string;
  };
};
export type UserSecretKey = {
  /** The users secret key */
  secret_key?: string;
};
export type UsersWithId = UserWithId[];
export type Ulid = string;
export type SecretName = string;
export type ModificationDate = string;
export type SecretKind = "general" | "storage";
export type SecretWithId = {
  id: Ulid;
  name: SecretName;
  modification_date: ModificationDate;
  kind: SecretKind;
};
export type SecretsList = SecretWithId[];
export type SecretValue = string;
export type SecretPost = {
  name: SecretName;
  value: SecretValue;
  kind: SecretKind;
};
export type SecretPatch = {
  value: SecretValue;
};
export type Version = {
  version: string;
};
export const {
  useGetUserQuery,
  useGetUserSecretKeyQuery,
  useGetUsersQuery,
  useGetUsersByUserIdQuery,
  useGetUserSecretsQuery,
  usePostUserSecretsMutation,
  useGetUserSecretsBySecretIdQuery,
  usePatchUserSecretsBySecretIdMutation,
  useDeleteUserSecretsBySecretIdMutation,
  useGetErrorQuery,
  useGetVersionQuery,
} = injectedRtkApi;
