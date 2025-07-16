import { ValidationError } from './errorHandler';

export function validateProjectUid(uid: string, context: string): void {
  if (!uid || uid.trim().length === 0) {
    throw new ValidationError(`Project UID is required`, context);
  }
  
  if (uid.length < 3) {
    throw new ValidationError(`Project UID must be at least 3 characters long`, context);
  }
  
  // Basic format validation (alphanumeric and common special chars)
  if (!/^[a-zA-Z0-9_-]+$/.test(uid)) {
    throw new ValidationError(`Project UID contains invalid characters. Only alphanumeric characters, hyphens, and underscores are allowed.`, context);
  }
}

export function validateArray<T>(array: T[], minLength: number = 0, context: string = 'Array'): void {
  if (!Array.isArray(array)) {
    throw new ValidationError(`${context} must be an array`, context);
  }
  
  if (array.length < minLength) {
    throw new ValidationError(`${context} must contain at least ${minLength} items`, context);
  }
}

export function validateRequired(value: any, fieldName: string, context: string): void {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(`${fieldName} is required`, context);
  }
}

export function validateStringLength(value: string, fieldName: string, minLength: number, maxLength: number, context: string): void {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} must be a string`, context);
  }
  
  if (value.length < minLength) {
    throw new ValidationError(`${fieldName} must be at least ${minLength} characters long`, context);
  }
  
  if (value.length > maxLength) {
    throw new ValidationError(`${fieldName} must be no more than ${maxLength} characters long`, context);
  }
}

export function validateEnum<T>(value: T, allowedValues: T[], fieldName: string, context: string): void {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(`${fieldName} must be one of: ${allowedValues.join(', ')}`, context);
  }
}
