import { platformApi } from '../../app/api';

export interface Organization {
  id: string;
  name: string;
  code: string;
  legalName?: string;
  registrationNumber?: string;
  taxId?: string;
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
}

export interface Division {
  id: string;
  name: string;
  code: string;
  description?: string;
  headEmployeeId?: string;
  active: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  headEmployeeId?: string;
  active: boolean;
}

export interface SubDepartment {
  id: string;
  name: string;
  code: string;
  description?: string;
  active: boolean;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  timezone?: string;
  locationType?: string;
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
  code: string;
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  active: boolean;
}

export interface Designation {
  id: string;
  name: string;
  code: string;
  level?: number;
  jobFamily?: string;
  description?: string;
  active: boolean;
}

export interface EmploymentType {
  id: string;
  name: string;
  code: string;
  description?: string;
  probationDays?: number;
  noticePeriodDays?: number;
  active: boolean;
}

export interface CostCenter {
  id: string;
  name: string;
  code: string;
  description?: string;
  budget?: number;
  currency?: string;
  active: boolean;
}

export const orgDnaApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizations: builder.query<Organization[], void>({
      query: () => '/v1/org-dna/organizations',
      transformResponse: (response: any) => response.data || [],
    }),
    updateOrganization: builder.mutation<Organization, { id: string; body: Partial<Organization> }>({
      query: ({ id, body }) => ({
        url: `/v1/org-dna/organizations/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    createOrganization: builder.mutation<Organization, Partial<Organization>>({
      query: (body) => ({
        url: '/v1/org-dna/organizations',
        method: 'POST',
        body,
      }),
    }),

    getBusinessUnits: builder.query<BusinessUnit[], string>({
      query: (orgId) => `/v1/org-dna/organizations/${orgId}/business-units`,
      transformResponse: (response: any) => response.data || [],
    }),
    createBusinessUnit: builder.mutation<BusinessUnit, { orgId: string; body: Partial<BusinessUnit> }>({
      query: ({ orgId, body }) => ({
        url: `/v1/org-dna/organizations/${orgId}/business-units`,
        method: 'POST',
        body,
      }),
    }),
    updateBusinessUnit: builder.mutation<BusinessUnit, { id: string; body: Partial<BusinessUnit> }>({
      query: ({ id, body }) => ({
        url: `/v1/org-dna/business-units/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteBusinessUnit: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/business-units/${id}`,
        method: 'DELETE',
      }),
    }),

    getDivisions: builder.query<Division[], string>({
      query: (buId) => `/v1/org-dna/business-units/${buId}/divisions`,
      transformResponse: (response: any) => response.data || [],
    }),
    createDivision: builder.mutation<Division, { buId: string; body: Partial<Division> }>({
      query: ({ buId, body }) => ({
        url: `/v1/org-dna/business-units/${buId}/divisions`,
        method: 'POST',
        body,
      }),
    }),
    updateDivision: builder.mutation<Division, { id: string; body: Partial<Division> }>({
      query: ({ id, body }) => ({
        url: `/v1/org-dna/divisions/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteDivision: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/divisions/${id}`,
        method: 'DELETE',
      }),
    }),

    getDepartments: builder.query<Department[], string>({
      query: (divId) => `/v1/org-dna/divisions/${divId}/departments`,
      transformResponse: (response: any) => response.data || [],
    }),
    createDepartment: builder.mutation<Department, { divId: string; body: Partial<Department> }>({
      query: ({ divId, body }) => ({
        url: `/v1/org-dna/divisions/${divId}/departments`,
        method: 'POST',
        body,
      }),
    }),
    updateDepartment: builder.mutation<Department, { id: string; body: Partial<Department> }>({
      query: ({ id, body }) => ({
        url: `/v1/org-dna/departments/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteDepartment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/departments/${id}`,
        method: 'DELETE',
      }),
    }),

    getSubDepartments: builder.query<SubDepartment[], string>({
      query: (deptId) => `/v1/org-dna/departments/${deptId}/sub-departments`,
      transformResponse: (response: any) => response.data || [],
    }),
    createSubDepartment: builder.mutation<SubDepartment, { deptId: string; body: Partial<SubDepartment> }>({
      query: ({ deptId, body }) => ({
        url: `/v1/org-dna/departments/${deptId}/sub-departments`,
        method: 'POST',
        body,
      }),
    }),
    updateSubDepartment: builder.mutation<SubDepartment, { id: string; body: Partial<SubDepartment> }>({
      query: ({ id, body }) => ({
        url: `/v1/org-dna/sub-departments/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteSubDepartment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/sub-departments/${id}`,
        method: 'DELETE',
      }),
    }),

    getLocations: builder.query<Location[], string>({
      query: (orgId) => `/v1/org-dna/organizations/${orgId}/locations`,
      transformResponse: (response: any) => response.data || [],
    }),
    createLocation: builder.mutation<Location, { orgId: string; body: Partial<Location> }>({
      query: ({ orgId, body }) => ({
        url: `/v1/org-dna/organizations/${orgId}/locations`,
        method: 'POST',
        body,
      }),
    }),
    updateLocation: builder.mutation<Location, { id: string; body: Partial<Location> }>({
      query: ({ id, body }) => ({
        url: `/v1/org-dna/locations/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteLocation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/locations/${id}`,
        method: 'DELETE',
      }),
    }),

    getGrades: builder.query<Grade[], string>({
      query: (orgId) => `/v1/org-dna/organizations/${orgId}/grades`,
      transformResponse: (response: any) => response.data || [],
    }),
    createGrade: builder.mutation<Grade, { orgId: string; body: Partial<Grade> }>({
      query: ({ orgId, body }) => ({
        url: `/v1/org-dna/organizations/${orgId}/grades`,
        method: 'POST',
        body,
      }),
    }),
    updateGrade: builder.mutation<Grade, { id: string; body: Partial<Grade> }>({
      query: ({ id, body }) => ({
        url: `/v1/org-dna/grades/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteGrade: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/grades/${id}`,
        method: 'DELETE',
      }),
    }),

    getBands: builder.query<Band[], string>({
      query: (orgId) => `/v1/org-dna/organizations/${orgId}/bands`,
      transformResponse: (response: any) => response.data || [],
    }),
    createBand: builder.mutation<Band, { orgId: string; body: Partial<Band> }>({
      query: ({ orgId, body }) => ({
        url: `/v1/org-dna/organizations/${orgId}/bands`,
        method: 'POST',
        body,
      }),
    }),
    updateBand: builder.mutation<Band, { id: string; body: Partial<Band> }>({
      query: ({ id, body }) => ({
        url: `/v1/org-dna/bands/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteBand: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/bands/${id}`,
        method: 'DELETE',
      }),
    }),

    getDesignations: builder.query<Designation[], string>({
      query: (orgId) => `/v1/org-dna/organizations/${orgId}/designations`,
      transformResponse: (response: any) => response.data || [],
    }),
    createDesignation: builder.mutation<Designation, { orgId: string; body: Partial<Designation> }>({
      query: ({ orgId, body }) => ({
        url: `/v1/org-dna/organizations/${orgId}/designations`,
        method: 'POST',
        body,
      }),
    }),
    updateDesignation: builder.mutation<Designation, { id: string; body: Partial<Designation> }>({
      query: ({ id, body }) => ({
        url: `/v1/org-dna/designations/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteDesignation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/designations/${id}`,
        method: 'DELETE',
      }),
    }),

    getEmploymentTypes: builder.query<EmploymentType[], string>({
      query: (orgId) => `/v1/org-dna/organizations/${orgId}/employment-types`,
      transformResponse: (response: any) => response.data || [],
    }),
    createEmploymentType: builder.mutation<EmploymentType, { orgId: string; body: Partial<EmploymentType> }>({
      query: ({ orgId, body }) => ({
        url: `/v1/org-dna/organizations/${orgId}/employment-types`,
        method: 'POST',
        body,
      }),
    }),
    updateEmploymentType: builder.mutation<EmploymentType, { id: string; body: Partial<EmploymentType> }>({
      query: ({ id, body }) => ({
        url: `/v1/org-dna/employment-types/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteEmploymentType: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/employment-types/${id}`,
        method: 'DELETE',
      }),
    }),

    getCostCenters: builder.query<CostCenter[], string>({
      query: (orgId) => `/v1/org-dna/organizations/${orgId}/cost-centers`,
      transformResponse: (response: any) => response.data || [],
    }),
    createCostCenter: builder.mutation<CostCenter, { orgId: string; body: Partial<CostCenter> }>({
      query: ({ orgId, body }) => ({
        url: `/v1/org-dna/organizations/${orgId}/cost-centers`,
        method: 'POST',
        body,
      }),
    }),
    updateCostCenter: builder.mutation<CostCenter, { id: string; body: Partial<CostCenter> }>({
      query: ({ id, body }) => ({
        url: `/v1/org-dna/cost-centers/${id}`,
        method: 'PUT',
        body,
      }),
    }),
    deleteCostCenter: builder.mutation<void, string>({
      query: (id) => ({
        url: `/v1/org-dna/cost-centers/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetOrganizationsQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,

  useGetBusinessUnitsQuery,
  useCreateBusinessUnitMutation,
  useUpdateBusinessUnitMutation,
  useDeleteBusinessUnitMutation,

  useGetDivisionsQuery,
  useCreateDivisionMutation,
  useUpdateDivisionMutation,
  useDeleteDivisionMutation,

  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,

  useGetSubDepartmentsQuery,
  useCreateSubDepartmentMutation,
  useUpdateSubDepartmentMutation,
  useDeleteSubDepartmentMutation,

  useGetLocationsQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,

  useGetGradesQuery,
  useCreateGradeMutation,
  useUpdateGradeMutation,
  useDeleteGradeMutation,

  useGetBandsQuery,
  useCreateBandMutation,
  useUpdateBandMutation,
  useDeleteBandMutation,

  useGetDesignationsQuery,
  useCreateDesignationMutation,
  useUpdateDesignationMutation,
  useDeleteDesignationMutation,

  useGetEmploymentTypesQuery,
  useCreateEmploymentTypeMutation,
  useUpdateEmploymentTypeMutation,
  useDeleteEmploymentTypeMutation,

  useGetCostCentersQuery,
  useCreateCostCenterMutation,
  useUpdateCostCenterMutation,
  useDeleteCostCenterMutation,
} = orgDnaApi;
