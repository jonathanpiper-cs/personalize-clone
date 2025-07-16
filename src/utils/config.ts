import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export interface AppConfig {
  contentstack: {
    authToken: string;
    baseUrl: string;
  };
  personalize: {
    apiUrl: string;
  };
}

class ConfigManager {
  private config: AppConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): AppConfig {
    const authToken = process.env.CONTENTSTACK_AUTH_TOKEN;
    if (!authToken) {
      throw new Error('CONTENTSTACK_AUTH_TOKEN environment variable is required');
    }

    return {
      contentstack: {
        authToken,
        baseUrl: process.env.CONTENTSTACK_BASE_URL || 'https://api.contentstack.io',
      },
      personalize: {
        apiUrl: process.env.PERSONALIZE_API_URL || 'https://personalize-api.contentstack.com',
      },
    };
  }

  public getConfig(): AppConfig {
    return this.config;
  }

  public getAuthToken(): string {
    return this.config.contentstack.authToken;
  }

  public getContentstackBaseUrl(): string {
    return this.config.contentstack.baseUrl;
  }

  public getPersonalizeApiUrl(): string {
    return this.config.personalize.apiUrl;
  }
}

// Export singleton instance
export const config = new ConfigManager();
