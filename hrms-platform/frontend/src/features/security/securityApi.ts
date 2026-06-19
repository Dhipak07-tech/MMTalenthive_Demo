import { platformApi } from '../../app/api';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  employeeId: string | null;
  active: boolean;
  roles: Role[];
  status?: string;
  locked?: boolean;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  priority: number;
}

export interface Permission {
  id: string;
  name: string;
  code: string;
  module: string;
  permissionKey: string;
}

export interface TokenResponse {
  token: string;
  username: string;
  tenantId: string;
  role: string;
  employeeId: string | null;
}

export const securityApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/v1/security/users',
      transformResponse: (response: { data: User[] }) => response.data,
      providesTags: ['User'],
    }),
    createUser: builder.mutation<User, Partial<User> & { password?: string; roleCodes?: string[] }>({
      query: (body) => ({
        url: '/v1/security/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    assignRole: builder.mutation<User, { userId: string; roleCode: string }>({
      query: ({ userId, roleCode }) => ({
        url: `/v1/security/users/${userId}/roles`,
        method: 'POST',
        body: { roleCode },
      }),
      invalidatesTags: ['User'],
    }),
    revokeRole: builder.mutation<User, { userId: string; roleId: string }>({
      query: ({ userId, roleId }) => ({
        url: `/v1/security/users/${userId}/roles/${roleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    getRoles: builder.query<Role[], void>({
      query: () => '/v1/security/roles',
      transformResponse: (response: { data: Role[] }) => response.data,
      providesTags: ['Role'],
    }),
    getPermissions: builder.query<Permission[], void>({
      query: () => '/v1/security/permissions',
      transformResponse: (response: { data: Permission[] }) => response.data,
    }),
    generateToken: builder.mutation<TokenResponse, { username: string; tenantId: string; role: string; employeeId?: string }>({
      query: (body) => ({
        url: '/v1/security/auth/token',
        method: 'POST',
        body,
      }),
      transformResponse: (response: { data: TokenResponse }) => response.data,
    }),
    lockUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/v1/security/users/${userId}/lock`,
        method: 'PUT',
      }),
      invalidatesTags: ['User'],
    }),
    unlockUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/v1/security/users/${userId}/unlock`,
        method: 'PUT',
      }),
      invalidatesTags: ['User'],
    }),
    resendActivation: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/v1/security/users/${userId}/resend-activation`,
        method: 'POST',
      }),
    }),
    adminResetPassword: builder.mutation<void, { userId: string; password?: string }>({
      query: ({ userId, password }) => ({
        url: `/v1/security/users/${userId}/reset-password`,
        method: 'PUT',
        body: { password },
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useAssignRoleMutation,
  useRevokeRoleMutation,
  useGetRolesQuery,
  useGetPermissionsQuery,
  useGenerateTokenMutation,
  useLockUserMutation,
  useUnlockUserMutation,
  useResendActivationMutation,
  useAdminResetPasswordMutation,
} = securityApi;
