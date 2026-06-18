import { platformApi } from '../../app/api';

export interface Skill {
  id?: string;
  name: string;
  category: 'TECHNICAL' | 'FUNCTIONAL' | 'SOFT';
  level: string;
}

export interface Document {
  id?: string;
  name: string;
  type: string;
  size: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  expiry: string;
}

export interface Relationship {
  id?: string;
  name: string;
  role: string;
  type: 'MANAGER' | 'BUDDY' | 'HRBP' | 'MENTEE' | 'SUBORDINATE';
}

export interface TimelineEvent {
  id?: string;
  date: string;
  title: string;
  description: string;
}

export interface EmployeeTwin {
  id?: string;
  employeeCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  displayName: string;
  workEmail: string;
  personalEmail?: string;
  workPhone?: string;
  personalPhone?: string;
  gender?: string;
  dateOfBirth?: string;
  currentAddress?: string;
  permanentAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  // DNA
  organizationId?: string;
  businessUnitId?: string;
  divisionId?: string;
  departmentId?: string;
  subDepartmentId?: string;
  designationId?: string;
  locationId?: string;
  gradeId?: string;
  bandId?: string;
  costCenterId?: string;
  employmentTypeId?: string;
  managerId?: string;
  dateOfJoining?: string;
  employmentStatus: 'ACTIVE' | 'ON_PROBATION' | 'ON_NOTICE' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED';
  workMode?: string;
  // Compliance
  panNumber?: string;
  aadhaarNumber?: string;
  uanNumber?: string;
  esicNumber?: string;
  passportNumber?: string;
  passportExpiry?: string;
  // Banking
  bankName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankBranch?: string;
  // Extensions
  skills?: Skill[];
  certifications?: any[];
  documents?: Document[];
  relationships?: any[];
  timeline?: TimelineEvent[];
}

export const employeesApi = platformApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployees: builder.query<EmployeeTwin[], void>({
      query: () => '/v1/employees',
      transformResponse: (response: any) => response.data || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Employee' as const, id })),
              { type: 'Employee', id: 'LIST' },
            ]
          : [{ type: 'Employee', id: 'LIST' }],
    }),
    getEmployeeById: builder.query<EmployeeTwin, string>({
      query: (id) => `/v1/employees/${id}`,
      transformResponse: (response: any) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Employee', id }],
    }),
    createEmployee: builder.mutation<EmployeeTwin, Partial<EmployeeTwin>>({
      query: (body) => ({
        url: '/v1/employees',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }],
    }),
    updateEmployee: builder.mutation<EmployeeTwin, { id: string; body: Partial<EmployeeTwin> }>({
      query: ({ id, body }) => ({
        url: `/v1/employees/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Employee', id }, { type: 'Employee', id: 'LIST' }],
    }),
    transferEmployee: builder.mutation<EmployeeTwin, { id: string; departmentId: string; locationId: string }>({
      query: ({ id, departmentId, locationId }) => ({
        url: `/v1/employees/${id}/transfer`,
        method: 'POST',
        params: { newDepartmentId: departmentId, newLocationId: locationId },
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Employee', id }, { type: 'Employee', id: 'LIST' }],
    }),
    promoteEmployee: builder.mutation<EmployeeTwin, { id: string; designationId: string; gradeId: string }>({
      query: ({ id, designationId, gradeId }) => ({
        url: `/v1/employees/${id}/promote`,
        method: 'POST',
        params: { newDesignationId: designationId, newGradeId: gradeId },
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Employee', id }, { type: 'Employee', id: 'LIST' }],
    }),
    changeManager: builder.mutation<EmployeeTwin, { id: string; managerId: string }>({
      query: ({ id, managerId }) => ({
        url: `/v1/employees/${id}/change-manager`,
        method: 'POST',
        params: { newManagerId: managerId },
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Employee', id }, { type: 'Employee', id: 'LIST' }],
    }),
    terminateEmployee: builder.mutation<EmployeeTwin, { id: string; exitDate: string; reason: string }>({
      query: ({ id, exitDate, reason }) => ({
        url: `/v1/employees/${id}/terminate`,
        method: 'POST',
        params: { exitDate, reason },
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Employee', id }, { type: 'Employee', id: 'LIST' }],
    }),
    getCompletionScore: builder.query<number, string>({
      query: (id) => `/v1/employees/${id}/completion`,
      transformResponse: (response: any) => response.data,
    }),
    onboardEmployee: builder.mutation<EmployeeTwin, Partial<EmployeeTwin>>({
      query: (body) => ({
        url: '/v1/onboarding',
        method: 'POST',
        body,
      }),
      transformResponse: (response: any) => response.data,
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeByIdQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useTransferEmployeeMutation,
  usePromoteEmployeeMutation,
  useChangeManagerMutation,
  useTerminateEmployeeMutation,
  useGetCompletionScoreQuery,
  useOnboardEmployeeMutation,
} = employeesApi;
