import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';

import {environment as env} from '@env';
import {Router} from '@angular/router';
import {hasOwn} from '../../app/helpers';

export type HttpParam = number | string | null;
export type HttpParamsItem = HttpParam | HttpParams | HttpParams[] | FormData;

export interface NotesResponse {
  data: object | null;
  error: string | null;
  success: boolean;
}

export interface HttpParams {
  [param: string]: HttpParamsItem;
}

@Injectable({
  providedIn: 'root'
})
export class RestApiService {
  constructor(
    protected http: HttpClient,
    protected router: Router,
  ) {
  }

  private static makeUrl(action: string, params: HttpParams = {}): string {
    let queryString = '';
    for (const name in params) {
      if (hasOwn(params, name)) {
        const value = params[name];
        if (value !== null) {
          queryString += `&${encodeURIComponent(name)}=${encodeURIComponent(value.toString())}`;
        }
      }
    }
    if (queryString) {
      queryString = '?' + queryString.slice(1);
    }
    return `${env.apiUrl}${action}${queryString}`;
  }

  private static bodyParams(params: HttpParams = {}): HttpParams {
    const result: HttpParams = {};
    for (const name in params) {
      if (hasOwn(params, name)) {
        const value = params[name];
        if (value !== null) {
          result[name] = value;
        }
      }
    }
    return result;
  }

  protected getResponseBody(response: HttpResponse<NotesResponse>): NotesResponse {
    return response.body || {
      success: false,
      error: 'Something went wrong.',
      data: null,
    };
  }

  protected async get<T>(
    action: string,
    params: HttpParams = {}): Promise<T> {
    return this.req<T>('GET', action, params);
  }

  protected async post<T>(
    action: string,
    params: HttpParams = {}): Promise<T> {
    return this.req<T>('POST', action, params);
  }

  protected async put<T>(
    action: string,
    params: HttpParams = {}): Promise<T> {
    return this.req<T>('PUT', action, params);
  }

  protected async create<T>(
    action: string,
    params: HttpParams = {}): Promise<T> {
    return this.req<T>('CREATE', action, params);
  }

  protected async delete<T>(
    action: string,
    params: HttpParams = {}): Promise<T> {
    return this.req<T>('DELETE', action, params);
  }

  private async req<T>(
    method: string = 'GET',
    action: string,
    params: HttpParams = {}): Promise<T> {
    const url = RestApiService.makeUrl(action, method === 'GET' ? params : {});

    try {
      const addOptions: { body?: HttpParams } = {};
      if (method !== 'GET') {
        addOptions.body = RestApiService.bodyParams(params);
      }

      const response = await this.http.request(method, url, {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
        }),
        observe: 'response',
        responseType: 'json',
        withCredentials: true,
        reportProgress: false,
        ...addOptions,
      }).toPromise();

      // @ts-ignore
      const {body: info}: NotesResponse = response;
      if (!info || !info.success) {
        throw ((info || {}).error || 'Something went wrong.');
      }

      return info.data;
    } catch (error) {
      if (error.status === 0 && error.error instanceof ProgressEvent) {
        throw error.error;
      } else {
        throw error;
      }
    }
  }
}
