#!/usr/bin/env node

import { CommandRegistry } from './commands';
import { logger } from './utils/logger';
import { exitWithError, ValidationError } from './utils/errorHandler';

function main() {
  const args = process.argv.slice(2);
  const registry = new CommandRegistry();
  
  if (args.length === 0) {
    registry.showUsage();
    return;
  }

  const [commandName, ...commandArgs] = args;

  try {
    logger.section('Personalize Clone CLI');
    
    registry.executeCommand(commandName, commandArgs);
  } catch (error) {
    const validationError = new ValidationError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      'Main'
    );
    exitWithError(validationError);
  }
}

if (require.main === module) {
  main();
}
