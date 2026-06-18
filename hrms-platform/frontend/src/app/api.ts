import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';

/**
 * Platform API — RTK Query base API for all modules.
 *
 * Every feature module injects its own endpoints via `platformApi.injectEndpoints()`.
 * This provides:
 * - Automatic caching and invalidation
 * - Request deduplication
 * - Loading/error states
 * - Optimistic updates
 *
 * The base query automatically attaches JWT token and tenant ID headers.
 */
export const platformApi = createApi({
  reducerPath: 'platformApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const token = state.auth.accessToken;
      const tenantId = state.auth.tenant;

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      if (tenantId) {
        headers.set('X-Tenant-ID', tenantId);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: [
    'Employee', 'OrgDna', 'LeaveRequest', 'LeaveBalance',
    'Recognition', 'Notification', 'Workflow', 'AuditLog',
    'Module', 'User', 'Role',
  ],
  endpoints: () => ({}), // Modules inject their own endpoints
});
