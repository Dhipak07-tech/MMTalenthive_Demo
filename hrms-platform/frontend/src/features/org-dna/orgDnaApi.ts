import { platformApi } from '../../app/api';

export interface Organization {
  id: string;
  name: string;
  code: string;
  legalName?: string;
  industry?: string;
  website?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  address?: string;
  country?: string;
  currency?: string;
  timezone?: string;
  active: boolean;
}

export interface BusinessUnit {
  id: string;
  name: string;
  code: string;
  description?: string;
  headEmployeeId?: string;
  active: boolean;
  divisions?: Division[];
}

export interface Division {
  id: string;
  name: string;
  code: string;
  description?: string;
  headEmployeeId?: string;
  active: boolean;
  departments?: Department[];
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  headEmployeeId?: string;
  active: boolean;
  subDepartments?: SubDepartment[];
}

export interface SubDepartment {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  type?: string;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  active: boolean;
}

export interface Grade {
  id: string;
  name: string;
  code: string;
  level?: number;
  active: boolean;
}

export interface Band {
  id: string;
  name: string;
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  active: boolean;
}

export const orgDnaApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizations: builder.query<Organization[], void>({
      query: () => '/v1/org-dna/organizations',
      transformResponse: (response: any) => response.data || [],
    }),
    getBusinessUnits: builder.query<BusinessUnit[], string>({
      query: (orgId) => `/v1/org-dna/organizations/${orgId}/business-units`,
      transformResponse: (response: any) => response.data || [],
    }),
    getDivisions: builder.query<Division[], string>({
      query: (buId) => `/v1/org-dna/business-units/${buId}/divisions`,
      transformResponse: (response: any) => response.data || [],
    }),
    getDepartments: builder.query<Department[], string>({
      query: (divId) => `/v1/org-dna/divisions/${divId}/departments`,
      transformResponse: (response: any) => response.data || [],
    }),
    getSubDepartments: builder.query<SubDepartment[], string>({
      query: (deptId) => `/v1/org-dna/departments/${deptId}/sub-departments`,
      transformResponse: (response: any) => response.data || [],
    }),
    getLocations: builder.query<Location[], string>({
      query: (orgId) => `/v1/org-dna/organizations/${orgId}/locations`,
      transformResponse: (response: any) => response.data || [],
    }),
    getGrades: builder.query<Grade[], string>({
      query: (orgId) => `/v1/org-dna/organizations/${orgId}/grades`,
      transformResponse: (response: any) => response.data || [],
    }),
    getBands: builder.query<Band[], string>({
      query: (orgId) => `/v1/org-dna/organizations/${orgId}/bands`,
      transformResponse: (response: any) => response.data || [],
    }),
    createOrganization: builder.mutation<Organization, Partial<Organization>>({
      query: (body) => ({
        url: '/v1/org-dna/organizations',
        method: 'POST',
        body,
      }),
    }),
    createBusinessUnit: builder.mutation<BusinessUnit, { orgId: string; body: Partial<BusinessUnit> }>({
      query: ({ orgId, body }) => ({
        url: `/v1/org-dna/organizations/${orgId}/business-units`,
        method: 'POST',
        body,
      }),
    }),
    createLocation: builder.mutation<Location, { orgId: string; body: Partial<Location> }>({
      query: ({ orgId, body }) => ({
        url: `/v1/org-dna/organizations/${orgId}/locations`,
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useGetOrganizationsQuery,
  useGetBusinessUnitsQuery,
  useGetDivisionsQuery,
  useGetDepartmentsQuery,
  useGetSubDepartmentsQuery,
  useGetLocationsQuery,
  useGetGradesQuery,
  useGetBandsQuery,
  useCreateOrganizationMutation,
  useCreateBusinessUnitMutation,
  useCreateLocationMutation,
} = orgDnaApi;
