import { CliCommand } from '../types';
import { MigrationService } from '../services/migrationService';
import { logger } from '../utils/logger';
import { exitWithError, ValidationError } from '../utils/errorHandler';
import { validateProjectUid } from '../utils/validation';

export class MigrateCommand implements CliCommand {
  public readonly name = 'migrate';
  public readonly description = 'Migrate configuration from source to target project';

  public async handler(args: string[]): Promise<void> {
    if (!this.validate(args)) {
      const error = new ValidationError(
        'Both source UID and target UID are required for migrate command. Usage: personalize-clone migrate <sourceUID> <targetUID>',
        'MigrateCommand'
      );
      exitWithError(error);
    }

    const [sourceUID, targetUID] = args;

    try {
      // Validate project UIDs
      validateProjectUid(sourceUID, 'MigrateCommand');
      validateProjectUid(targetUID, 'MigrateCommand');
      
      logger.section('Migration Started');
      logger.info(`Source Project: ${sourceUID}`);
      logger.info(`Target Project: ${targetUID}`);

      const migrationService = new MigrationService(sourceUID, targetUID);
      const result = await migrationService.performMigration();

      if (result.success) {
        logger.section('Migration Summary');
        const summaryMessage = result.experiencesSkipped > 0 
          ? `Migration completed successfully!
        - ${result.attributesMigrated} attributes migrated
        - ${result.audiencesMigrated} audiences migrated
        - ${result.experiencesMigrated} experiences migrated
        - ${result.experiencesSkipped} experiences skipped (had ACTIVE versions)`
          : `Migration completed successfully!
        - ${result.attributesMigrated} attributes migrated
        - ${result.audiencesMigrated} audiences migrated
        - ${result.experiencesMigrated} experiences migrated`;
        
        logger.success(summaryMessage);
      } else {
        logger.error('Migration failed', 'MigrateCommand', {
          errors: result.errors
        });
        process.exit(1);
      }

    } catch (error) {
      logger.error('Migration failed with unexpected error', 'MigrateCommand', error);
      process.exit(1);
    }
  }

  public validate(args: string[]): boolean {
    return args.length === 2 && args[0].trim() !== '' && args[1].trim() !== '';
  }
}
