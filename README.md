# personalize-clone

A command-line TypeScript project.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

## Development

- Run in development mode:
  ```bash
  npm run dev
  ```

- Watch for changes:
  ```bash
  npm run watch
  ```

- Build for production:
  ```bash
  npm run build
  ```

- Run built version:
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

2. **Optional Base URL**:
   ```bash
   # Set custom API base URL if needed
   CONTENTSTACK_BASE_URL=https://api.contentstack.io
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

## Project Structure

```
personalize-clone/
├── src/
│   ├── index.ts          # Main entry point and CLI logic
│   └── personalizeApi.ts # Personalize API functions and interfaces
├── dist/                 # Compiled JavaScript output
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
├── .env.example          # Environment variables template
└── README.md             # This file
```

## Adding Commands

Edit `src/index.ts` to add new commands to the CLI tool.
