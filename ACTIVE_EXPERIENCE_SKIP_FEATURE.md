# ACTIVE Experience Version Skip Feature

## Overview

This feature prevents the migration tool from overwriting experiences that already have ACTIVE versions in the target project. This is a safety mechanism to avoid accidentally disrupting live experiences.

## How It Works

### 1. **Detection Logic**
- When processing an experience that already exists in the target project, the migration service checks if it has any ACTIVE versions
- Uses the `checkForActiveVersions()` method to query the target project's experience versions
- Looks for any version with `status: 'ACTIVE'`

### 2. **Skip Behavior**
- If an ACTIVE version is found, the experience migration is skipped
- A warning message is logged: `"Skipping experience '{name}' - already has ACTIVE version in target project"`
- The experience mapping is still created for consistency, but version migration is bypassed

### 3. **Reporting**
- Skipped experiences are tracked and reported in the migration summary
- The final output shows both migrated and skipped experience counts
- Example output:
  ```
  Migration completed successfully!
  - 5 attributes migrated
  - 3 audiences migrated
  - 2 experiences migrated
  - 1 experiences skipped (had ACTIVE versions)
  ```

## Code Changes

### Modified Files

1. **`src/services/migrationService.ts`**
   - Added `checkForActiveVersions()` method to check for ACTIVE versions
   - Updated `migrateExperiences()` to skip experiences with ACTIVE versions
   - Modified return type to include `skippedCount`
   - Updated `performMigration()` to track and report skipped experiences

2. **`src/types/index.ts`**
   - Added `experiencesSkipped: number` to `MigrationResult` interface

3. **`src/commands/migrateCommand.ts`**
   - Updated success message to conditionally show skipped experiences

### Key Methods

```typescript
// Check if experience has ACTIVE versions
private checkForActiveVersions(experienceUid: string): Promise<boolean>

// Updated migration method with skip logic
public migrateExperiences(
  experiencesWithVersions: ExperienceWithVersions[],
  audienceMappings: AudienceMapping[]
): Promise<{ mappings: ExperienceMapping[], skippedCount: number }>
```

## Error Handling

- If version checking fails, the migration proceeds as normal (fail-safe approach)
- Warning is logged: `"Could not check versions for experience {uid}, proceeding with migration"`
- This prevents API issues from blocking the entire migration

## Benefits

1. **Safety**: Prevents accidental overwriting of live experiences
2. **Transparency**: Clear reporting of what was skipped and why
3. **Consistency**: Maintains mapping relationships even for skipped experiences
4. **Fail-Safe**: Graceful handling of API errors during version checking
5. **User Control**: Users can see exactly what happened during migration

## Usage

No changes to command-line usage - the feature works automatically:

```bash
personalize-clone migrate sourceUID targetUID
```

The skip behavior is automatic when ACTIVE versions are detected in the target project.

## Future Enhancements

Potential future improvements could include:
- Command-line flag to force overwrite ACTIVE experiences
- Interactive prompts for user confirmation
- Detailed reporting of which specific experiences were skipped
- Option to skip only certain statuses (e.g., skip ACTIVE but allow PAUSED)
