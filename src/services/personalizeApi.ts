import { PersonalizeAttribute, PersonalizeAudience, PersonalizeExperience, PersonalizeExperienceVersion, ExperienceWithVersions } from '../types';
import { PersonalizeHttpClient } from './httpClient';
import { logger } from '../utils/logger';
import { withErrorHandling } from '../utils/errorHandler';

export class PersonalizeApi {
  private client: PersonalizeHttpClient;

  constructor(projectUid: string) {
    this.client = new PersonalizeHttpClient(projectUid);
  }

  public getAllAttributes = withErrorHandling(async (): Promise<PersonalizeAttribute[]> => {
    logger.section('Fetching Attributes');
    return this.client.get<PersonalizeAttribute[]>('attributes');
  }, 'getAllAttributes');

  public getAllAudiences = withErrorHandling(async (): Promise<PersonalizeAudience[]> => {
    logger.section('Fetching Audiences');
    return this.client.get<PersonalizeAudience[]>('audiences');
  }, 'getAllAudiences');

  public getAllExperiences = withErrorHandling(async (): Promise<PersonalizeExperience[]> => {
    logger.section('Fetching Experiences');
    return this.client.get<PersonalizeExperience[]>('experiences');
  }, 'getAllExperiences');

  public getExperienceVersions = withErrorHandling(async (experienceUid: string): Promise<PersonalizeExperienceVersion[]> => {
    logger.section(`Fetching Experience Versions for ${experienceUid}`);
    return this.client.get<PersonalizeExperienceVersion[]>(`experiences/${experienceUid}/versions`);
  }, 'getExperienceVersions');

  public getAllExperiencesWithVersions = withErrorHandling(async (): Promise<ExperienceWithVersions[]> => {
    const experiences = await this.getAllExperiences();

    const experiencesWithVersions: ExperienceWithVersions[] = await Promise.all(
      experiences.map(async (exp): Promise<ExperienceWithVersions> => {
        const versions = await this.getExperienceVersions(exp.uid);
        return { experience: exp, versions };
      })
    );

    logger.success('Successfully fetched experiences and their versions');
    return experiencesWithVersions;
  }, 'getAllExperiencesWithVersions');
}

