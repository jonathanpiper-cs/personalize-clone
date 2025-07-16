import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import { handleAxiosError } from '../utils/errorHandler';

export class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string, projectUid?: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'authtoken': config.getAuthToken(),
    };

    if (projectUid) {
      this.defaultHeaders['x-project-uid'] = projectUid;
    }
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    const url = `${this.baseURL}/${endpoint}`;
    const headers = { ...this.defaultHeaders, ...additionalHeaders };

    const requestConfig: AxiosRequestConfig = {
      method,
      url,
      headers,
      data,
    };

    try {
      logger.apiCall(endpoint, method);
      const response: AxiosResponse<T> = await axios(requestConfig);
      logger.apiSuccess(endpoint);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error, endpoint);
    }
  }

  public async get<T>(endpoint: string, additionalHeaders?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, additionalHeaders);
  }

  public async post<T>(endpoint: string, data: any, additionalHeaders?: Record<string, string>): Promise<T> {
    return this.request<T>('POST', endpoint, data, additionalHeaders);
  }

  public async put<T>(endpoint: string, data: any, additionalHeaders?: Record<string, string>): Promise<T> {
    return this.request<T>('PUT', endpoint, data, additionalHeaders);
  }

  public async delete<T>(endpoint: string, additionalHeaders?: Record<string, string>): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, additionalHeaders);
  }
}

export class PersonalizeHttpClient extends HttpClient {
  constructor(projectUid: string) {
    super(config.getPersonalizeApiUrl(), projectUid);
  }
}

export class ContentstackHttpClient extends HttpClient {
  constructor() {
    super(config.getContentstackBaseUrl());
  }
}
