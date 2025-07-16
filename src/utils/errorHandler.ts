import { logger } from './logger';

export class PersonalizeError extends Error {
  public readonly code: string;
  public readonly context?: string;
  public readonly originalError?: Error;

  constructor(message: string, code: string, context?: string, originalError?: Error) {
    super(message);
    this.name = 'PersonalizeError';
    this.code = code;
    this.context = context;
    this.originalError = originalError;
  }
}

export class ValidationError extends PersonalizeError {
  constructor(message: string, context?: string) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

export class ApiError extends PersonalizeError {
  public readonly statusCode?: number;
  public readonly responseData?: any;

  constructor(message: string, statusCode?: number, responseData?: any, context?: string) {
    super(message, 'API_ERROR', context);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.responseData = responseData;
  }
}

export class ConfigurationError extends PersonalizeError {
  constructor(message: string, context?: string) {
    super(message, 'CONFIG_ERROR', context);
    this.name = 'ConfigurationError';
  }
}

export function handleAxiosError(error: any, context: string): ApiError {
  let message = 'Unknown API error';
  let statusCode: number | undefined;
  let responseData: any;

  if (error.response) {
    statusCode = error.response.status;
    responseData = error.response.data;
    message = `HTTP ${statusCode}: ${error.response.statusText}`;
    
    if (responseData?.message) {
      message = responseData.message;
    }
  } else if (error.request) {
    message = 'No response received from server';
  } else {
    message = error.message || 'Unknown error occurred';
  }

  const apiError = new ApiError(message, statusCode, responseData, context);
  logger.apiError(context, apiError);
  return apiError;
}

export function handleError(error: unknown, context: string): PersonalizeError {
  if (error instanceof PersonalizeError) {
    return error;
  }

  if (error instanceof Error) {
    return new PersonalizeError(error.message, 'UNKNOWN_ERROR', context, error);
  }

  return new PersonalizeError(
    'An unknown error occurred',
    'UNKNOWN_ERROR',
    context,
    error instanceof Error ? error : undefined
  );
}

export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw handleError(error, context);
    }
  };
}

export function exitWithError(error: PersonalizeError, exitCode: number = 1): never {
  logger.error(`Application failed: ${error.message}`, error.context, {
    code: error.code,
    originalError: error.originalError?.message,
  });
  
  process.exit(exitCode);
}
