import { CliCommand } from '../types';
import { logger } from '../utils/logger';

export class HelpCommand implements CliCommand {
  public readonly name = 'help';
  public readonly description = 'Show help information';

  private commands: CliCommand[];

  constructor(commands: CliCommand[]) {
    this.commands = commands;
  }

  public async handler(args: string[]): Promise<void> {
    logger.section('Personalize Clone CLI Help');
    
    console.log('Usage: personalize-clone <command> [options]');
    console.log('');
    console.log('Available commands:');
    
    this.commands.forEach(command => {
      console.log(`  ${command.name.padEnd(15)} - ${command.description}`);
    });

    console.log('');
    console.log('Environment variables:');
    console.log('  CONTENTSTACK_AUTH_TOKEN  - Your Contentstack auth token (required)');
    console.log('  CONTENTSTACK_BASE_URL    - API base URL (optional, defaults to https://api.contentstack.io)');
    console.log('  PERSONALIZE_API_URL      - Personalize API URL (optional, defaults to https://personalize-api.contentstack.com)');
    console.log('');
    console.log('Examples:');
    console.log('  personalize-clone auth                              # Test authentication');
    console.log('  personalize-clone migrate source123 target456      # Migrate configuration');
    console.log('  personalize-clone help                              # Show this help');
  }

  public validate(args: string[]): boolean {
    return args.length === 0; // Help command takes no arguments
  }
}
