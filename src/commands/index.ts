import { CliCommand } from '../types';
import { AuthCommand } from './authCommand';
import { MigrateCommand } from './migrateCommand';
import { HelpCommand } from './helpCommand';
import { logger } from '../utils/logger';
import { exitWithError, ValidationError } from '../utils/errorHandler';

export class CommandRegistry {
  private commands: Map<string, CliCommand> = new Map();

  constructor() {
    this.registerCommands();
  }

  private registerCommands(): void {
    const authCommand = new AuthCommand();
    const migrateCommand = new MigrateCommand();
    
    // Register basic commands first
    this.commands.set(authCommand.name, authCommand);
    this.commands.set(migrateCommand.name, migrateCommand);
    
    // Create help command with all available commands
    const allCommands = Array.from(this.commands.values());
    const helpCommand = new HelpCommand(allCommands);
    this.commands.set(helpCommand.name, helpCommand);
  }

  public getCommand(name: string): CliCommand | undefined {
    return this.commands.get(name);
  }

  public getAllCommands(): CliCommand[] {
    return Array.from(this.commands.values());
  }

  public async executeCommand(commandName: string, args: string[]): Promise<void> {
    const command = this.getCommand(commandName);
    
    if (!command) {
      const error = new ValidationError(
        `Unknown command: ${commandName}. Run "personalize-clone help" for available commands.`,
        'CommandRegistry'
      );
      exitWithError(error);
    }

    if (command.validate && !command.validate(args)) {
      const error = new ValidationError(
        `Invalid arguments for command: ${commandName}. Run "personalize-clone help" for usage information.`,
        'CommandRegistry'
      );
      exitWithError(error);
    }

    try {
      await command.handler(args);
    } catch (error) {
      logger.error(`Command ${commandName} failed`, 'CommandRegistry', error);
      process.exit(1);
    }
  }

  public showUsage(): void {
    console.log('Usage: personalize-clone <command>');
    console.log('');
    console.log('Available commands:');
    this.getAllCommands().forEach(command => {
      console.log(`  ${command.name.padEnd(15)} - ${command.description}`);
    });
    console.log('');
    console.log('Run "personalize-clone help" for detailed information.');
  }
}
