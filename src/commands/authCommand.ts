import { CliCommand } from '../types';
import { ContentstackHttpClient } from '../services/httpClient';
import { logger } from '../utils/logger';
import { config } from '../utils/config';
import { exitWithError, ValidationError } from '../utils/errorHandler';

export class AuthCommand implements CliCommand {
  public readonly name = 'auth';
  public readonly description = 'Test auth token validation';

  public async handler(args: string[]): Promise<void> {
    try {
      logger.section('Authentication Test');
      
      const client = new ContentstackHttpClient();
      
      // Test the auth token by making a call to the user endpoint
      await client.get('v3/user', {
        'Authorization': `Bearer ${config.getAuthToken()}`
      });
      
      logger.success('Authentication successful! Token is valid and ready to use.');
      
    } catch (error) {
      const authError = new ValidationError(
        'Authentication failed. Please check your CONTENTSTACK_AUTH_TOKEN environment variable.',
        'AuthCommand'
      );
      exitWithError(authError);
    }
  }

  public validate(args: string[]): boolean {
    return args.length === 0; // Auth command takes no arguments
  }
}
