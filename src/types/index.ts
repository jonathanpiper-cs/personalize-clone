// Core Personalize API types
export interface PersonalizeAttribute {
  uid: string;
  name: string;
  key: string;
  description?: string;
  __type: string;
}

export interface PersonalizeAudience {
  uid: string;
  name: string;
  description?: string;
  definition: any;
}

export interface PersonalizeExperience {
  uid: string;
  name: string;
  description?: string;
  __type: 'SEGMENTED' | 'AB_TEST';
  latestVersion?: any;
}

export interface PersonalizeExperienceVersion {
  uid: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'PAUSED';
  createdAt: string;
  updatedAt: string;
  variants: any[];
  targeting?: any;
  metrics?: any[];
  variantSplit?: string;
}

// API Response types
export interface PersonalizeApiResponse<T> {
  data: T[];
}

export interface CreateAttributeResponse {
  data: PersonalizeAttribute;
}

export interface CreateAudienceResponse {
  data: PersonalizeAudience;
}

export interface CreateExperienceResponse {
  data: PersonalizeExperience;
}

// Composite types
export interface ExperienceWithVersions {
  experience: PersonalizeExperience;
  versions: PersonalizeExperienceVersion[];
}

export interface SourceConfiguration {
  attributes: PersonalizeAttribute[];
  audiences: PersonalizeAudience[];
  experiencesWithVersions: ExperienceWithVersions[];
}

// Mapping types
export interface AttributeMapping {
  sourceUid: string;
  targetUid: string;
  name: string;
  __type: string;
}

export interface AudienceMapping {
  sourceUid: string;
  targetUid: string;
  name: string;
  description?: string;
}

export interface ExperienceMapping {
  sourceUid: string;
  targetUid: string;
  name: string;
  description?: string;
  __type: 'SEGMENTED' | 'AB_TEST';
  latestVersion?: any;
}

// CLI types
export interface CliCommand {
  name: string;
  description: string;
  handler: (args: string[]) => Promise<void>;
  validate?: (args: string[]) => boolean;
}

export interface MigrationProgress {
  step: string;
  total: number;
  current: number;
  completed: boolean;
  error?: string;
}

export interface MigrationResult {
  success: boolean;
  attributesMigrated: number;
  audiencesMigrated: number;
  experiencesMigrated: number;
  errors: string[];
}
