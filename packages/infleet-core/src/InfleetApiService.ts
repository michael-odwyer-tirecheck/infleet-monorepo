import {
  InfleetApiError,
  InfleetAuthError,
  InfleetNotFoundError,
  InfleetTimeoutError,
} from './errors';
import type {
  Vehicle,
  Tire,
  VehicleHistoryEvent,
  VehicleQueryParams,
  TireQueryParams,
  VehicleHistoryQueryParams,
} from './types';

export interface InfleetApiConfig {
  /** e.g. "https://infleet.tirecheck.com/api/public" */
  baseUrl:    string;
  /** Passed as: Authorization2: ApiKey <apiKey> */
  apiKey:     string;
  /** Request timeout in ms. Default: 30000 */
  timeoutMs?: number;
}

export class InfleetApiService {
  private readonly config: InfleetApiConfig;

  constructor(config: InfleetApiConfig) {
    this.config = config;
  }

  // ---------------------------------------------------------------------------
  // Core HTTP helper
  // ---------------------------------------------------------------------------
  private async request<T>(
    method:  'GET' | 'POST' | 'PUT',
    path:    string,
    params?: Record<string, string | undefined>,
    body?:   unknown,
  ): Promise<T> {
    const { baseUrl, apiKey, timeoutMs = 30_000 } = this.config;

    let url = `${baseUrl}${path}`;
    if (params) {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) qs.set(k, v);
      }
      const str = qs.toString();
      if (str) url += `?${str}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization2': `ApiKey ${apiKey}`,
          'Content-Type':   'application/json',
          'Accept':         'application/json',
        },
        body:   body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new InfleetAuthError(path);
        if (res.status === 404)                        throw new InfleetNotFoundError(path);
        const text = await res.text().catch(() => '');
        throw new InfleetApiError(res.status, text || res.statusText, path);
      }

      return res.json() as Promise<T>;
    } catch (e) {
      if ((e as Error).name === 'AbortError') throw new InfleetTimeoutError(path);
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }

  // ---------------------------------------------------------------------------
  // Vehicles
  // ---------------------------------------------------------------------------
  getVehicles(params?: VehicleQueryParams): Promise<Vehicle[]> {
    return this.request<Vehicle[]>('GET', '/vehicles', params as Record<string, string | undefined>);
  }

  createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    return this.request<Vehicle>('POST', '/vehicles', undefined, data);
  }

  updateVehicle(vehicleId: string, data: Partial<Vehicle>): Promise<Vehicle> {
    return this.request<Vehicle>('PUT', `/vehicles/${encodeURIComponent(vehicleId)}`, undefined, data);
  }

  // ---------------------------------------------------------------------------
  // Tires
  // ---------------------------------------------------------------------------
  getTires(params?: TireQueryParams): Promise<Tire[]> {
    return this.request<Tire[]>('GET', '/tires', params as Record<string, string | undefined>);
  }

  createTire(data: Partial<Tire>): Promise<Tire> {
    return this.request<Tire>('POST', '/tires', undefined, data);
  }

  updateTire(tireId: string, data: Partial<Tire>): Promise<Tire> {
    return this.request<Tire>('PUT', `/tires/${encodeURIComponent(tireId)}`, undefined, data);
  }

  // ---------------------------------------------------------------------------
  // Vehicle History
  // ---------------------------------------------------------------------------
  getVehicleHistory(params?: VehicleHistoryQueryParams): Promise<VehicleHistoryEvent[]> {
    return this.request<VehicleHistoryEvent[]>('GET', '/vehiclehistory', params as Record<string, string | undefined>);
  }
}
