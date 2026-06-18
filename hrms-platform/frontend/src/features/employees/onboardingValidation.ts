// ══════════════════════════════════════════════════════════════════════════════
// Employee Onboarding — Validation & Profile Health Engine
// ══════════════════════════════════════════════════════════════════════════════
//
// Enterprise HRMS Standard (Workday / SAP SuccessFactors / Darwinbox aligned):
//   • Employee Twin creation requires ONLY core identity + employment fields
//   • All other sections are OPTIONAL during onboarding
//   • Profile Completion is a HEALTH SCORE, not a creation blocker
//   • Missing info can be enriched progressively via Employee 360 Workspace
//
// Pure validation functions with no React dependencies — fully unit-testable.
// ══════════════════════════════════════════════════════════════════════════════

export type StepStatus = 'not_started' | 'in_progress' | 'error' | 'completed';

export interface StepValidationResult {
  status: StepStatus;
  errors: string[];
  /** Number of required fields filled */
  filledCount: number;
  /** Total number of required fields */
  totalRequired: number;
  /** Whether this step is mandatory for creation */
  isMandatory: boolean;
}

export interface OnboardingFormData {
  // Step 1: Identity
  firstName: string;
  lastName: string;
  workEmail: string;
  personalEmail: string;
  workPhone: string;
  personalPhone: string;
  gender: string;
  dateOfBirth: string;

  // Step 2: Employment DNA
  dateOfJoining: string;
  selectedOrg: string;
  selectedBU: string;
  selectedDiv: string;
  selectedDept: string;
  selectedLoc: string;
  selectedGrade: string;
  selectedBand: string;
  managerId: string;
  workMode: string;
  designation: string;
  employmentType?: string;

  // Step 3: Compliance
  panNumber: string;
  aadhaarNumber: string;
  uanNumber: string;
  esicNumber: string;

  // Step 4: Banking
  bankName: string;
  bankAccountNumber: string;
  bankIfsc: string;

  // Step 5: Skills & Certifications
  skillsList: any[];
  certificationsList: any[];

  // Step 6: Documents
  documentsList: any[];

  // Step 7: Relationships
  buddyId: string;
  mentorId: string;
  hrbpId: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// MANDATORY STEPS — Required for Employee Twin creation
// ══════════════════════════════════════════════════════════════════════════════

// ── Step 1: Identity (MANDATORY) ──────────────────────────────────────────────
// Required: First Name, Last Name, Work Email
// Optional during creation: Work Phone, Gender, Date of Birth, Personal Email

export function validateStep1(data: OnboardingFormData): StepValidationResult {
  const errors: string[] = [];
  const requiredChecks = [
    { value: data.firstName.trim(), label: 'First Name' },
    { value: data.lastName.trim(), label: 'Last Name' },
    { value: data.workEmail.trim(), label: 'Work Email' },
  ];

  for (const check of requiredChecks) {
    if (!check.value) {
      errors.push(check.label);
    }
  }

  // Format validation — only validate if provided
  if (data.workEmail.trim() && !data.workEmail.includes('@')) {
    errors.push('Work Email (invalid format)');
  }

  const filledCount = requiredChecks.filter(c => !!c.value).length;
  const totalRequired = requiredChecks.length;

  return {
    status: deriveStatus(filledCount, totalRequired, errors),
    errors,
    filledCount,
    totalRequired,
    isMandatory: true,
  };
}

// ── Step 2: Employment DNA (MANDATORY) ────────────────────────────────────────
// Required: Organization, Department, Designation, Employment Type, Date of Joining
// Optional during creation: BU, Division, Location, Grade, Band, Manager

export function validateStep2(data: OnboardingFormData): StepValidationResult {
  const errors: string[] = [];
  const requiredChecks = [
    { value: data.selectedOrg.trim(), label: 'Organization' },
    { value: data.selectedDept.trim(), label: 'Department' },
    { value: data.designation.trim(), label: 'Designation' },
    { value: (data.employmentType || '').trim(), label: 'Employment Type' },
    { value: data.dateOfJoining.trim(), label: 'Date of Joining' },
  ];

  for (const check of requiredChecks) {
    if (!check.value) {
      errors.push(check.label);
    }
  }

  const filledCount = requiredChecks.filter(c => !!c.value).length;
  const totalRequired = requiredChecks.length;

  return {
    status: deriveStatus(filledCount, totalRequired, errors),
    errors,
    filledCount,
    totalRequired,
    isMandatory: true,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// OPTIONAL STEPS — Enrich progressively after creation
// ══════════════════════════════════════════════════════════════════════════════

// ── Step 3: Compliance (OPTIONAL) ─────────────────────────────────────────────

export function validateStep3(data: OnboardingFormData): StepValidationResult {
  const optionalChecks = [
    { value: data.panNumber.trim(), label: 'PAN Number' },
    { value: data.aadhaarNumber.trim(), label: 'Aadhaar Number' },
    { value: data.uanNumber.trim(), label: 'UAN Number' },
    { value: data.esicNumber.trim(), label: 'ESIC Number' },
  ];

  const errors: string[] = [];

  // Format validation only when provided — never block creation
  if (data.panNumber.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(data.panNumber.trim())) {
    errors.push('PAN Number (invalid format — expected ABCDE1234F)');
  }
  if (data.aadhaarNumber.trim() && !/^\d{4}\s?\d{4}\s?\d{4}$/.test(data.aadhaarNumber.trim())) {
    errors.push('Aadhaar Number (invalid format — expected 12 digits)');
  }

  const filledCount = optionalChecks.filter(c => !!c.value).length;

  return {
    status: filledCount === optionalChecks.length ? 'completed' : filledCount > 0 ? 'in_progress' : 'not_started',
    errors,
    filledCount,
    totalRequired: 0, // No required fields — all optional
    isMandatory: false,
  };
}

// ── Step 4: Banking (OPTIONAL) ────────────────────────────────────────────────

export function validateStep4(data: OnboardingFormData): StepValidationResult {
  const optionalChecks = [
    { value: data.bankName.trim(), label: 'Bank Name' },
    { value: data.bankAccountNumber.trim(), label: 'Account Number' },
    { value: data.bankIfsc.trim(), label: 'IFSC Code' },
  ];

  const filledCount = optionalChecks.filter(c => !!c.value).length;

  return {
    status: filledCount === optionalChecks.length ? 'completed' : filledCount > 0 ? 'in_progress' : 'not_started',
    errors: [],
    filledCount,
    totalRequired: 0,
    isMandatory: false,
  };
}

// ── Step 5: Skills & Certs (OPTIONAL) ─────────────────────────────────────────

export function validateStep5(data: OnboardingFormData): StepValidationResult {
  const hasSkills = data.skillsList.length > 0;
  const hasCerts = data.certificationsList.length > 0;
  const filledCount = (hasSkills ? 1 : 0) + (hasCerts ? 1 : 0);

  return {
    status: filledCount > 0 ? 'completed' : 'not_started',
    errors: [],
    filledCount,
    totalRequired: 0,
    isMandatory: false,
  };
}

// ── Step 6: Documents (OPTIONAL) ──────────────────────────────────────────────

export function validateStep6(data: OnboardingFormData): StepValidationResult {
  const hasDocs = data.documentsList.length > 0;

  return {
    status: hasDocs ? 'completed' : 'not_started',
    errors: [],
    filledCount: hasDocs ? 1 : 0,
    totalRequired: 0,
    isMandatory: false,
  };
}

// ── Step 7: Relationships (OPTIONAL) ──────────────────────────────────────────

export function validateStep7(data: OnboardingFormData): StepValidationResult {
  const hasRelationships = !!(data.buddyId || data.mentorId || data.hrbpId || data.managerId);

  return {
    status: hasRelationships ? 'completed' : 'not_started',
    errors: [],
    filledCount: hasRelationships ? 1 : 0,
    totalRequired: 0,
    isMandatory: false,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// Aggregate Validation & Profile Health Engine
// ══════════════════════════════════════════════════════════════════════════════

export type StepValidator = (data: OnboardingFormData) => StepValidationResult;

/** Step number → validator function map */
export const STEP_VALIDATORS: Record<number, StepValidator> = {
  1: validateStep1,
  2: validateStep2,
  3: validateStep3,
  4: validateStep4,
  5: validateStep5,
  6: validateStep6,
  7: validateStep7,
};

/** Steps that MUST pass validation before Employee Twin creation */
export const MANDATORY_STEPS = [1, 2];

/** Steps that are optional — contribute to profile health score only */
export const OPTIONAL_STEPS = [3, 4, 5, 6, 7];

// ── Profile Health Weights ────────────────────────────────────────────────────
// Used for Profile Completion % health score (NOT for creation blocking)

export interface ProfileHealthSection {
  stepNumber: number;
  label: string;
  weight: number; // percentage weight out of 100
  fields: { key: string; label: string; potentialGain: number }[];
}

export const PROFILE_HEALTH_SECTIONS: ProfileHealthSection[] = [
  {
    stepNumber: 1,
    label: 'Identity & Contact',
    weight: 20,
    fields: [
      { key: 'firstName', label: 'First Name', potentialGain: 4 },
      { key: 'lastName', label: 'Last Name', potentialGain: 4 },
      { key: 'workEmail', label: 'Work Email', potentialGain: 4 },
      { key: 'workPhone', label: 'Work Phone', potentialGain: 3 },
      { key: 'gender', label: 'Gender', potentialGain: 2 },
      { key: 'dateOfBirth', label: 'Date of Birth', potentialGain: 3 },
    ],
  },
  {
    stepNumber: 2,
    label: 'Employment DNA',
    weight: 25,
    fields: [
      { key: 'selectedOrg', label: 'Organization', potentialGain: 5 },
      { key: 'selectedDept', label: 'Department', potentialGain: 5 },
      { key: 'designation', label: 'Designation', potentialGain: 5 },
      { key: 'employmentType', label: 'Employment Type', potentialGain: 3 },
      { key: 'dateOfJoining', label: 'Date of Joining', potentialGain: 4 },
      { key: 'managerId', label: 'Reporting Manager', potentialGain: 3 },
    ],
  },
  {
    stepNumber: 3,
    label: 'Compliance',
    weight: 15,
    fields: [
      { key: 'panNumber', label: 'PAN Number', potentialGain: 5 },
      { key: 'aadhaarNumber', label: 'Aadhaar Number', potentialGain: 5 },
      { key: 'uanNumber', label: 'UAN Number', potentialGain: 3 },
      { key: 'esicNumber', label: 'ESIC Number', potentialGain: 2 },
    ],
  },
  {
    stepNumber: 4,
    label: 'Banking',
    weight: 10,
    fields: [
      { key: 'bankName', label: 'Bank Name', potentialGain: 3 },
      { key: 'bankAccountNumber', label: 'Account Number', potentialGain: 4 },
      { key: 'bankIfsc', label: 'IFSC Code', potentialGain: 3 },
    ],
  },
  {
    stepNumber: 5,
    label: 'Skills & Certifications',
    weight: 5,
    fields: [
      { key: 'skillsList', label: 'Skills', potentialGain: 3 },
      { key: 'certificationsList', label: 'Certifications', potentialGain: 2 },
    ],
  },
  {
    stepNumber: 6,
    label: 'Documents',
    weight: 10,
    fields: [
      { key: 'documentsList', label: 'Documents', potentialGain: 10 },
    ],
  },
  {
    stepNumber: 7,
    label: 'Relationships',
    weight: 15,
    fields: [
      { key: 'managerId', label: 'Reporting Manager', potentialGain: 6 },
      { key: 'buddyId', label: 'Buddy', potentialGain: 3 },
      { key: 'mentorId', label: 'Mentor', potentialGain: 3 },
      { key: 'hrbpId', label: 'HRBP', potentialGain: 3 },
    ],
  },
];

// ── Profile Health Score Calculator ───────────────────────────────────────────

export interface ProfileHealthItem {
  label: string;
  filled: boolean;
  potentialGain: number;
  sectionLabel: string;
  stepNumber: number;
}

export function computeProfileHealth(data: OnboardingFormData): {
  score: number;
  items: ProfileHealthItem[];
  missingItems: ProfileHealthItem[];
} {
  const items: ProfileHealthItem[] = [];
  let totalWeight = 0;
  let filledWeight = 0;

  for (const section of PROFILE_HEALTH_SECTIONS) {
    const sectionTotalGain = section.fields.reduce((s, f) => s + f.potentialGain, 0);

    for (const field of section.fields) {
      const rawValue = (data as any)[field.key];
      const filled = Array.isArray(rawValue)
        ? rawValue.length > 0
        : typeof rawValue === 'string' ? rawValue.trim().length > 0 : !!rawValue;

      const normalizedGain = sectionTotalGain > 0
        ? (field.potentialGain / sectionTotalGain) * section.weight
        : 0;

      totalWeight += normalizedGain;
      if (filled) filledWeight += normalizedGain;

      items.push({
        label: field.label,
        filled,
        potentialGain: Math.round(normalizedGain),
        sectionLabel: section.label,
        stepNumber: section.stepNumber,
      });
    }
  }

  const score = totalWeight > 0 ? Math.round((filledWeight / totalWeight) * 100) : 0;
  const missingItems = items.filter(i => !i.filled);

  return { score, items, missingItems };
}

// ── Aggregate Validation Summary ──────────────────────────────────────────────

export interface ValidationSummary {
  stepResults: Record<number, StepValidationResult>;
  /** All mandatory steps (identity + employment DNA) pass */
  canSubmit: boolean;
  /** Profile health score (0-100) — NOT a creation blocker */
  completionPercentage: number;
  /** List of missing MANDATORY section labels */
  missingSections: { stepNumber: number; stepLabel: string; errors: string[] }[];
  /** Missing optional items with potential score improvement */
  optionalMissing: ProfileHealthItem[];
}

const STEP_LABELS: Record<number, string> = {
  1: 'Identity',
  2: 'Employment DNA',
  3: 'Compliance',
  4: 'Banking Details',
  5: 'Skills & Certs',
  6: 'Documents Upload',
  7: 'Relationships',
};

export function computeValidationSummary(data: OnboardingFormData): ValidationSummary {
  const stepResults: Record<number, StepValidationResult> = {};

  for (const [stepStr, validator] of Object.entries(STEP_VALIDATORS)) {
    const stepNum = parseInt(stepStr);
    stepResults[stepNum] = validator(data);
  }

  // canSubmit: ONLY mandatory steps (1 = Identity, 2 = Employment DNA) must pass
  const canSubmit = MANDATORY_STEPS.every(s => stepResults[s].status === 'completed');

  // Profile health score (weighted, not just mandatory fields)
  const { score: completionPercentage, missingItems: optionalMissing } = computeProfileHealth(data);

  // Collect missing mandatory sections only
  const missingSections: ValidationSummary['missingSections'] = [];
  for (const s of MANDATORY_STEPS) {
    if (stepResults[s].status !== 'completed') {
      missingSections.push({
        stepNumber: s,
        stepLabel: STEP_LABELS[s],
        errors: stepResults[s].errors,
      });
    }
  }

  return { stepResults, canSubmit, completionPercentage, missingSections, optionalMissing };
}

// ── Internal helper ───────────────────────────────────────────────────────────

function deriveStatus(filled: number, total: number, errors: string[]): StepStatus {
  if (filled === 0) return 'not_started';
  if (errors.length > 0) return filled < total ? 'in_progress' : 'error';
  return 'completed';
}
