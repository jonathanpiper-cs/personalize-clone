import { 
  PersonalizeAttribute, 
  PersonalizeAudience, 
  PersonalizeExperience, 
  PersonalizeExperienceVersion,
  ExperienceWithVersions,
  AttributeMapping,
  AudienceMapping,
  ExperienceMapping,
  SourceConfiguration,
  MigrationResult
} from '../types';
import { PersonalizeApi } from './personalizeApi';
import { PersonalizeHttpClient } from './httpClient';
import { logger } from '../utils/logger';
import { withErrorHandling } from '../utils/errorHandler';

export class MigrationService {
  private sourceApi: PersonalizeApi;
  private targetApi: PersonalizeApi;
  private targetClient: PersonalizeHttpClient;

  constructor(sourceProjectUid: string, targetProjectUid: string) {
    this.sourceApi = new PersonalizeApi(sourceProjectUid);
    this.targetApi = new PersonalizeApi(targetProjectUid);
    this.targetClient = new PersonalizeHttpClient(targetProjectUid);
  }

  public fetchSourceConfiguration = withErrorHandling(async (): Promise<SourceConfiguration> => {
    logger.section('Fetching Source Configuration');
    
    const [attributes, audiences, experiencesWithVersions] = await Promise.all([
      this.sourceApi.getAllAttributes(),
      this.sourceApi.getAllAudiences(),
      this.sourceApi.getAllExperiencesWithVersions()
    ]);

    const totalVersions = experiencesWithVersions.reduce((sum, exp) => sum + exp.versions.length, 0);
    
    logger.info(`Configuration Summary:
    - ${attributes.length} attributes
    - ${audiences.length} audiences  
    - ${experiencesWithVersions.length} experiences
    - ${totalVersions} experience versions`);

    return { attributes, audiences, experiencesWithVersions };
  }, 'fetchSourceConfiguration');

  public migrateAttributes = withErrorHandling(async (attributes: PersonalizeAttribute[]): Promise<AttributeMapping[]> => {
    logger.migration('attribute migration', 'start');
    
    const existingAttributes = await this.targetApi.getAllAttributes();
    const mappings: AttributeMapping[] = [];

    for (const attribute of attributes) {
      const existingAttribute = existingAttributes.find(
        existing => existing.name === attribute.name && existing.__type === attribute.__type
      );

      if (existingAttribute) {
        logger.info(`Skipping existing attribute: ${attribute.name}`);
        mappings.push({
          sourceUid: attribute.uid,
          targetUid: existingAttribute.uid,
          name: attribute.name,
          __type: attribute.__type
        });
      } else {
        logger.info(`Creating attribute: ${attribute.name}`);
        const payload = {
          name: attribute.name,
          description: attribute.description || '',
          key: attribute.key || '',
        };

        const response = await this.targetClient.post<PersonalizeAttribute>('attributes', payload);
        mappings.push({
          sourceUid: attribute.uid,
          targetUid: response.uid,
          name: attribute.name,
          __type: attribute.__type
        });
      }
    }

    logger.migration('attribute migration', 'success', { count: mappings.length });
    return mappings;
  }, 'migrateAttributes');

  public migrateAudiences = withErrorHandling(async (
    audiences: PersonalizeAudience[], 
    attributeMappings: AttributeMapping[]
  ): Promise<AudienceMapping[]> => {
    logger.migration('audience migration', 'start');
    
    const existingAudiences = await this.targetApi.getAllAudiences();
    const mappings: AudienceMapping[] = [];

    for (const audience of audiences) {
      const updatedDefinition = this.updateAttributeReferences(audience.definition, attributeMappings);
      
      const existingAudience = existingAudiences.find(existing => 
        existing.name === audience.name && 
        this.areDefinitionsEqual(existing.definition, updatedDefinition)
      );

      if (existingAudience) {
        logger.info(`Skipping existing audience: ${audience.name}`);
        mappings.push({
          sourceUid: audience.uid,
          targetUid: existingAudience.uid,
          name: audience.name,
          description: audience.description
        });
      } else {
        logger.info(`Creating audience: ${audience.name}`);
        const payload = {
          name: audience.name,
          description: audience.description || '',
          definition: updatedDefinition,
        };

        const response = await this.targetClient.post<PersonalizeAudience>('audiences', payload);
        mappings.push({
          sourceUid: audience.uid,
          targetUid: response.uid,
          name: audience.name,
          description: audience.description
        });
      }
    }

    logger.migration('audience migration', 'success', { count: mappings.length });
    return mappings;
  }, 'migrateAudiences');

  public migrateExperiences = withErrorHandling(async (
    experiencesWithVersions: ExperienceWithVersions[],
    audienceMappings: AudienceMapping[]
  ): Promise<ExperienceMapping[]> => {
    logger.migration('experience migration', 'start');
    
    const existingExperiences = await this.targetApi.getAllExperiences();
    const mappings: ExperienceMapping[] = [];

    for (const { experience, versions } of experiencesWithVersions) {
      let targetExperience = existingExperiences.find(existing =>
        existing.name === experience.name && existing.__type === experience.__type
      );

      if (!targetExperience) {
        logger.info(`Creating experience: ${experience.name}`);
        const payload = {
          name: experience.name,
          description: experience.description || '',
          __type: experience.__type,
        };

        targetExperience = await this.targetClient.post<PersonalizeExperience>('experiences', payload);
      } else {
        logger.info(`Using existing experience: ${experience.name}`);
      }

      const mapping: ExperienceMapping = {
        sourceUid: experience.uid,
        targetUid: targetExperience.uid,
        name: experience.name,
        description: experience.description,
        __type: experience.__type,
        latestVersion: targetExperience.latestVersion
      };

      mappings.push(mapping);

      // Migrate versions
      await this.migrateExperienceVersions(targetExperience, versions, audienceMappings);
    }

    logger.migration('experience migration', 'success', { count: mappings.length });
    return mappings;
  }, 'migrateExperiences');

  private migrateExperienceVersions = withErrorHandling(async (
    targetExperience: PersonalizeExperience,
    versions: PersonalizeExperienceVersion[],
    audienceMappings: AudienceMapping[]
  ): Promise<void> => {
    for (const version of versions) {
      logger.info(`Migrating version ${version.uid} for experience ${targetExperience.name}`);
      
      const updatedTargeting = this.updateAudienceReferences(version.targeting, audienceMappings);
      const updatedVariants = this.updateVariantAudienceReferences(version.variants, audienceMappings);

      const versionPayload = {
        status: 'ACTIVE',
        variants: updatedVariants,
        ...(targetExperience.__type === 'AB_TEST' && {
          targeting: updatedTargeting,
          metrics: version.metrics || [],
          variantSplit: version.variantSplit,
        }),
      };

      const versionEndpoint = `experiences/${targetExperience.uid}/versions/${targetExperience.latestVersion || 'latest'}`;
      await this.targetClient.put(versionEndpoint, versionPayload);
    }
  }, 'migrateExperienceVersions');

  private updateAttributeReferences(obj: any, mappings: AttributeMapping[]): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.updateAttributeReferences(item, mappings));

    const result = { ...obj };
    
    if (result.ref && typeof result.ref === 'string') {
      const mapping = mappings.find(m => m.sourceUid === result.ref);
      if (mapping) {
        result.ref = mapping.targetUid;
      }
    }

    for (const [key, value] of Object.entries(result)) {
      if (key !== 'ref') {
        result[key] = this.updateAttributeReferences(value, mappings);
      }
    }

    return result;
  }

  private updateAudienceReferences(obj: any, mappings: AudienceMapping[]): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.updateAudienceReferences(item, mappings));

    const result = { ...obj };

    if (result.audience && typeof result.audience === 'string') {
      const mapping = mappings.find(m => m.sourceUid === result.audience);
      if (mapping) result.audience = mapping.targetUid;
    }

    if (result.audience?.audiences && Array.isArray(result.audience.audiences)) {
      result.audience.audiences = result.audience.audiences.map((audienceUid: string) => {
        const mapping = mappings.find(m => m.sourceUid === audienceUid);
        return mapping ? mapping.targetUid : audienceUid;
      });
    }

    for (const [key, value] of Object.entries(result)) {
      if (key !== 'audience' && key !== 'audiences') {
        result[key] = this.updateAudienceReferences(value, mappings);
      }
    }

    return result;
  }

  private updateVariantAudienceReferences(variants: any[], mappings: AudienceMapping[]): any[] {
    if (!variants || !Array.isArray(variants)) return variants;

    return variants.map(variant => {
      const updated = { ...variant };
      delete updated.shortUid;

      if (updated.audiences && Array.isArray(updated.audiences)) {
        updated.audiences = updated.audiences.map((audienceUid: string) => {
          const mapping = mappings.find(m => m.sourceUid === audienceUid);
          return mapping ? mapping.targetUid : audienceUid;
        });
      }

      return updated;
    });
  }

  private areDefinitionsEqual(def1: any, def2: any): boolean {
    return JSON.stringify(def1) === JSON.stringify(def2);
  }

  public async performMigration(): Promise<MigrationResult> {
    try {
      const sourceConfig = await this.fetchSourceConfiguration();
      
      const attributeMappings = await this.migrateAttributes(sourceConfig.attributes);
      const audienceMappings = await this.migrateAudiences(sourceConfig.audiences, attributeMappings);
      const experienceMappings = await this.migrateExperiences(sourceConfig.experiencesWithVersions, audienceMappings);

      logger.section('Migration Complete');
      logger.success(`Successfully migrated:
      - ${attributeMappings.length} attributes
      - ${audienceMappings.length} audiences
      - ${experienceMappings.length} experiences`);

      return {
        success: true,
        attributesMigrated: attributeMappings.length,
        audiencesMigrated: audienceMappings.length,
        experiencesMigrated: experienceMappings.length,
        errors: []
      };
    } catch (error) {
      logger.error('Migration failed', 'MigrationService', error);
      return {
        success: false,
        attributesMigrated: 0,
        audiencesMigrated: 0,
        experiencesMigrated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
}
