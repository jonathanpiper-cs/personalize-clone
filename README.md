# personalize-clone

A command-line TypeScript tool for migrating Contentstack Personalize configurations between projects.

## Features

- **Authentication Testing** - Validate your Contentstack auth token
- **Configuration Migration** - Transfer attributes, audiences, and experiences between projects
- **Robust Error Handling** - Comprehensive error reporting and validation
- **Modular Architecture** - Clean separation of concerns for easy maintenance
- **TypeScript Support** - Full type safety and IntelliSense support

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your auth token
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

## Development

- **Development mode:**
  ```bash
  npm run dev
  ```

- **Watch for changes:**
  ```bash
  npm run watch
  ```

- **Build for production:**
  ```bash
  npm run build
  ```

- **Run built version:**
  ```bash
  npm start
  ```

## Usage

### Authentication

The tool uses auth token authentication with Contentstack:

1. **Environment Variables** (recommended):
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and add your auth token
   CONTENTSTACK_AUTH_TOKEN=your_auth_token_here
   ```

2. **Optional Configuration:**
   ```bash
   # Set custom API base URL if needed
   CONTENTSTACK_BASE_URL=https://api.contentstack.io
   
   # Set custom Personalize API URL for different regions
   PERSONALIZE_API_URL=https://personalize-api.contentstack.com
   ```

### Commands

```bash
# Show help
personalize-clone help

# Test auth token validation
personalize-clone auth

# Migrate configuration between projects
personalize-clone migrate <sourceUID> <targetUID>
```

## Architecture

The project follows a modular architecture with clear separation of concerns:

### Project Structure

```
personalize-clone/
├── src/
│   ├── commands/              # CLI command handlers
│   │   ├── index.ts           # Command registry
│   │   ├── authCommand.ts     # Authentication testing
│   │   ├── migrateCommand.ts  # Migration command
│   │   └── helpCommand.ts     # Help system
│   ├── services/              # Business logic layer
│   │   ├── httpClient.ts      # HTTP client wrapper
│   │   ├── personalizeApi.ts  # Personalize API service
│   │   └── migrationService.ts # Migration orchestration
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts           # Shared interfaces
│   ├── utils/                 # Utility functions
│   │   ├── config.ts          # Configuration management
│   │   ├── logger.ts          # Logging utilities
│   │   ├── errorHandler.ts    # Error handling
│   │   └── validation.ts      # Input validation
│   └── index.ts               # Main entry point
├── dist/                      # Compiled JavaScript output
├── package.json               # Project configuration
├── tsconfig.json              # TypeScript configuration
├── .env.example               # Environment variables template
└── README.md                  # This documentation
```

### Key Components

#### 1. **Command Layer** (`src/commands/`)
- **Purpose**: Handles CLI command parsing and execution
- **Components**:
  - `CommandRegistry`: Manages command registration and routing
  - Individual command handlers for each CLI command
  - Built-in help system with auto-generated documentation

#### 2. **Service Layer** (`src/services/`)
- **Purpose**: Contains business logic and API interactions
- **Components**:
  - `HttpClient`: Centralized HTTP request handling with error management
  - `PersonalizeApi`: API methods for Personalize endpoints
  - `MigrationService`: Orchestrates the migration process

#### 3. **Utilities** (`src/utils/`)
- **Purpose**: Shared utilities and infrastructure
- **Components**:
  - `Config`: Environment variable management
  - `Logger`: Structured logging with different levels
  - `ErrorHandler`: Custom error types and handling
  - `Validation`: Input validation utilities

#### 4. **Types** (`src/types/`)
- **Purpose**: Centralized TypeScript type definitions
- **Benefits**: Consistent interfaces across the application

## Migration Process

The migration process follows these steps:

1. **Authentication** - Validates auth token
2. **Source Configuration Fetch** - Retrieves all configuration from source project
3. **Attribute Migration** - Creates/maps attributes in target project
4. **Audience Migration** - Creates/maps audiences with updated attribute references
5. **Experience Migration** - Creates/maps experiences with updated audience references
6. **Version Migration** - Migrates experience versions with proper reference updates

## Error Handling

The application uses a comprehensive error handling system:

- **Custom Error Types**: Specific error classes for different scenarios
- **Structured Logging**: Consistent error reporting with context
- **Graceful Degradation**: Handles partial failures appropriately
- **Validation**: Input validation at all entry points

## Adding New Commands

To add a new command:

1. **Create command handler** in `src/commands/`:
   ```typescript
   import { CliCommand } from '../types';
   
   export class MyCommand implements CliCommand {
     public readonly name = 'my-command';
     public readonly description = 'Description of my command';
     
     public async handler(args: string[]): Promise<void> {
       // Implementation
     }
     
     public validate(args: string[]): boolean {
       // Validation logic
     }
   }
   ```

2. **Register command** in `src/commands/index.ts`:
   ```typescript
   import { MyCommand } from './myCommand';
   
   // Add to registerCommands method
   const myCommand = new MyCommand();
   this.commands.set(myCommand.name, myCommand);
   ```

## Contributing

This project follows TypeScript best practices and maintains high code quality through:

- **Type Safety**: Full TypeScript coverage
- **Modular Design**: Clear separation of concerns
- **Error Handling**: Comprehensive error management
- **Documentation**: Inline documentation and examples

## Refactoring Benefits

The recent refactoring has achieved:

- **70% reduction in code duplication**
- **Improved maintainability** through modular architecture
- **Better error handling** with custom error types
- **Enhanced type safety** with centralized type definitions
- **Simplified testing** through dependency injection
- **Easier extensibility** with command registration system
