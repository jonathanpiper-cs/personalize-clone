#!/usr/bin/env node

import axios from 'axios';
import dotenv from 'dotenv';
import { fetchSourceConfiguration, createAttributesInTarget, createAudiencesInTarget, createExperiencesInTarget } from './personalizeApi';

// Load environment variables from .env file
dotenv.config();

console.log('Hello from personalize-clone!');

// Function to get the auth token from environment variables
function getAuthToken(): string {
	const authToken = process.env.CONTENTSTACK_AUTH_TOKEN;
	if (!authToken) {
		throw new Error('CONTENTSTACK_AUTH_TOKEN environment variable is required');
	}
	return authToken;
}

// Function to validate auth token by making a test API call
async function validateAuthToken(token: string): Promise<boolean> {
	const baseUrl = process.env.CONTENTSTACK_BASE_URL || 'https://api.contentstack.io';
	const testUrl = `${baseUrl}/v3/user`;

	try {
		console.log('Validating auth token...');

		const response = await axios.get(testUrl, {
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			}
		});

		console.log('Auth token validation successful!');
		return true;
	} catch (error: any) {
		console.error('Auth token validation failed:');

		if (error.response) {
			console.error(`Status: ${error.response.status}`);
			console.error(`Status Text: ${error.response.statusText}`);
			console.error(`Response Data:`, error.response.data);
		} else if (error.request) {
			console.error('No response received:', error.message);
		} else {
			console.error('Error:', error.message);
		}

		return false;
	}
}

// Function to migrate configuration using project UIDs
async function migrateConfiguration(sourceUID: string, targetUID: string): Promise<void> {
	console.log(`Migrating configuration from source UID: ${sourceUID}`);
	console.log(`To target UID: ${targetUID}`);

	try {
		const authToken = getAuthToken();
		console.log('Auth token loaded!');

		// Fetch configuration from source project
		const sourceConfig = await fetchSourceConfiguration(sourceUID, authToken);

		// TODO: Implement target project migration
		// For now, just display what we fetched
		const totalVersions = sourceConfig.experiencesWithVersions.reduce((sum, exp) => sum + exp.versions.length, 0);

		console.log('\n=== Migration Preview ===');
		console.log('The following will be migrated to the target project:');
		console.log(`- ${sourceConfig.attributes.length} attributes`);
		console.log(`- ${sourceConfig.audiences.length} audiences`);
		console.log(`- ${sourceConfig.experiencesWithVersions.length} experiences`);
		console.log(`- ${totalVersions} experience versions`);

		console.log('\n=== Starting Migration ===');

		// Step 1: Create attributes in target project
		console.log('Creating attributes in target project...');
		const attributeMapping = await createAttributesInTarget(
			targetUID,
			authToken,
			sourceConfig.attributes
		);
		console.log(`Successfully created ${attributeMapping.length} attributes in target project`);

		// Step 2: Create audiences in target project
		console.log('Creating audiences in target project...');
		const audienceMapping = await createAudiencesInTarget(
			targetUID,
			authToken,
			sourceConfig.audiences,
			attributeMapping
		);
		console.log(`Successfully created ${audienceMapping.length} audiences in target project`);

		// Step 3: Create experiences in target project
		console.log('Creating experiences in target project...');
		const experienceMapping = await createExperiencesInTarget(
			targetUID,
			authToken,
			sourceConfig.experiencesWithVersions,
			audienceMapping
		);
		console.log(`Successfully created ${experienceMapping.length} experiences in target project`);

		console.log('\n=== Migration Complete ===');
		console.log('Successfully migrated all configuration to target project!');
		console.log(`- ${attributeMapping.length} attributes`);
		console.log(`- ${audienceMapping.length} audiences`);
		console.log(`- ${experienceMapping.length} experiences`);
		console.log('\nMigration completed successfully!');

		// TODO: Add remaining migration steps if needed
		// - Additional post-migration tasks or validations

	} catch (error) {
		console.error('Migration failed:', error);
		process.exit(1);
	}
}

// Function to handle authentication test
async function handleAuth(): Promise<void> {
	try {
		const authToken = getAuthToken();
		const isValid = await validateAuthToken(authToken);

		if (isValid) {
			console.log('Auth token is valid and ready to use');
		} else {
			console.log('Auth token is invalid, please check your environment variables');
			process.exit(1);
		}
	} catch (error) {
		console.error('Authentication test failed:', error);
		process.exit(1);
	}
}

// Add your command-line logic here
function main() {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		console.log('Usage: personalize-clone <command>');
		console.log('Available commands:');
		console.log('  help                - Show this help message');
		console.log('  auth                - Test auth token validation');
		console.log('  migrate <sourceUID> <targetUID> - Migrate configuration from source to target');
		return;
	}

	const command = args[0];

	switch (command) {
		case 'help':
			console.log('Help: This is your personalize-clone CLI tool');
			console.log('Commands:');
			console.log('  help                - Show this help message');
			console.log('  auth                - Test auth token validation');
			console.log('  migrate <sourceUID> <targetUID> - Migrate configuration from source to target');
			console.log('');
			console.log('Environment variables:');
			console.log('  CONTENTSTACK_AUTH_TOKEN - Your Contentstack auth token');
			console.log('  CONTENTSTACK_BASE_URL   - API base URL (optional, defaults to https://api.contentstack.io)');
			console.log('  PERSONALIZE_API_URL     - Personalize API URL (optional, defaults to https://personalize-api.contentstack.com)');
			break;
		case 'auth':
			handleAuth();
			break;
		case 'migrate':
			if (args.length < 3) {
				console.error('Error: Both source UID and target UID are required for migrate command');
				console.log('Usage: personalize-clone migrate <sourceUID> <targetUID>');
				process.exit(1);
			}
			const sourceUID = args[1];
			const targetUID = args[2];
			migrateConfiguration(sourceUID, targetUID);
			break;
		default:
			console.log(`Unknown command: ${command}`);
			console.log('Run \"personalize-clone help\" for available commands');
	}
}

if (require.main === module) {
	main();
}
